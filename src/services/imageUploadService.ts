import api from './api';

export interface ImageUploadResponse {
  url: string;
  success: boolean;
  message?: string;
  oldImageDeleted?: boolean | null; // null = ainda em processo
  deletionMessage?: string;
}

export interface ImageDeleteResponse {
  success: boolean;
  message?: string;
}

export type ImageUploadType = 'ingredients' | 'recipes' | 'users';

export interface ReplaceImageOptions {
  waitForDeletion?: boolean; // Se deve aguardar a exclusão da imagem antiga
  onOldImageDeleted?: (result: ImageDeleteResponse) => void; // Callback quando exclusão termina
}

class ImageUploadService {
  private baseURL = 'https://sgpro-api.squareweb.app/v1';

  /**
   * Faz upload de uma imagem
   * @param file - Arquivo de imagem
   * @param type - Tipo de upload (ingredients, recipes, users)
   * @returns Promise com a URL da imagem uploaded
   */
  async uploadImage(file: File, type: ImageUploadType): Promise<ImageUploadResponse> {
    try {
      if (!file) {
        throw new Error('Arquivo é obrigatório');
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos');
      }

      // Validar tamanho (máx 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post<{ url: string }>('/v1/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.url) {
        return {
          url: response.data.url,
          success: true,
          message: 'Upload realizado com sucesso!',
        };
      } else {
        throw new Error('URL não retornada pela API');
      }
    } catch (error: any) {
      console.error('Erro no upload de imagem:', error);

      let errorMessage = 'Erro ao fazer upload da imagem';

      if (error.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        url: '',
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Deleta uma imagem do servidor
   * @param imageUrl - URL da imagem a ser deletada
   * @returns Promise com o resultado da operação
   */
  async deleteImage(imageUrl: string): Promise<ImageDeleteResponse> {
    try {
      if (!imageUrl) {
        return { success: true, message: 'Nenhuma imagem para deletar' };
      }

      // A API espera a URL completa como parâmetro query (confirmado pelos testes)
      await api.delete('/v1/upload/image', {
        params: { url: imageUrl },
      });

      return {
        success: true,
        message: 'Imagem deletada com sucesso do servidor',
      };
    } catch (error: any) {
      console.error('❌ [IMAGE SERVICE] Erro ao deletar imagem:', error);

      // Log detalhado do erro para debugging
      if (error.response) {
        console.error('❌ [IMAGE SERVICE] Resposta do erro:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });
      }

      // Se o erro for 404 (imagem já não existe), considerar como sucesso
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'Imagem já foi removida do servidor (404)',
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || `Erro ao deletar imagem: ${error.message}`,
      };
    }
  }

  /**
   * Substitui uma imagem existente por uma nova
   * @param oldImageUrl - URL da imagem antiga (para deletar)
   * @param newFile - Novo arquivo de imagem
   * @param type - Tipo de upload
   * @param options - Opções para controlar o comportamento da substituição
   * @returns Promise com a URL da nova imagem e informações sobre a exclusão
   */
  async replaceImage(
    oldImageUrl: string | null,
    newFile: File,
    type: ImageUploadType,
    options?: ReplaceImageOptions,
  ): Promise<ImageUploadResponse> {
    const { waitForDeletion = false, onOldImageDeleted } = options || {};

    try {
      // Primeiro, faz upload da nova imagem
      const uploadResult = await this.uploadImage(newFile, type);

      if (!uploadResult.success) {
        console.error('❌ [IMAGE SERVICE] Falha no upload da nova imagem:', uploadResult.message);
        return uploadResult;
      }

      // Se não há imagem antiga, retorna apenas o resultado do upload
      if (!oldImageUrl) {
        return {
          ...uploadResult,
          oldImageDeleted: true,
          deletionMessage: 'Nenhuma imagem anterior para deletar',
        };
      }

      // Se deve aguardar a exclusão
      if (waitForDeletion) {
        const deleteResult = await this.deleteImage(oldImageUrl);

        // Chama callback se fornecido
        if (onOldImageDeleted) {
          onOldImageDeleted(deleteResult);
        }

        return {
          ...uploadResult,
          oldImageDeleted: deleteResult.success,
          deletionMessage: deleteResult.message,
        };
      } else {
        // Deletar a imagem antiga em background (não bloqueia o fluxo)

        this.deleteImage(oldImageUrl)
          .then((deleteResult) => {
            // Chama callback se fornecido
            if (onOldImageDeleted) {
              onOldImageDeleted(deleteResult);
            }
          })
          .catch((error) => {
            console.warn(
              '⚠️ [IMAGE SERVICE] Erro ao deletar imagem antiga em background (não crítico):',
              error,
            );

            // Chama callback com erro se fornecido
            if (onOldImageDeleted) {
              onOldImageDeleted({
                success: false,
                message: 'Erro ao deletar imagem antiga',
              });
            }
          });

        return {
          ...uploadResult,
          oldImageDeleted: null, // Ainda em processo
          deletionMessage: 'Exclusão da imagem antiga em andamento...',
        };
      }
    } catch (error: any) {
      console.error('❌ [IMAGE SERVICE] Erro ao substituir imagem:', error);
      return {
        url: '',
        success: false,
        message: error.message || 'Erro ao substituir imagem',
        oldImageDeleted: false,
        deletionMessage: 'Exclusão não foi executada devido ao erro no upload',
      };
    }
  }

  /**
   * Método para testar e identificar o padrão correto da API de delete
   * @param imageUrl - URL da imagem para teste
   */
  async testDeleteEndpoint(imageUrl: string): Promise<void> {
    const imageId = this.extractImageIdFromUrl(imageUrl);

    // Testar diferentes formatos de URL que a API pode aceitar
    const testEndpoints = [
      `/v1/upload/image/${imageId}`,
      `/v1/upload/image?id=${imageId}`,
      `/v1/upload/image?url=${encodeURIComponent(imageUrl)}`,
      `/v1/upload/delete/${imageId}`,
      `/v1/image/delete/${imageId}`,
    ];
  }

  /**
   * Extrai o ID da imagem da URL
   * @param url - URL da imagem
   * @returns ID da imagem ou null se não conseguir extrair
   */
  private extractImageIdFromUrl(url: string): string | null {
    try {
      // URL formato: https://public-blob.squarecloud.dev/hash/users/fileName.webp
      // Precisamos extrair apenas o fileName sem a extensão
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Remover extensão do arquivo para obter o ID
      const imageId = fileName.split('.')[0];

      // Verificar se temos um ID válido
      if (!imageId || imageId.length < 5) {
        console.warn('⚠️ [IMAGE SERVICE] ID extraído parece inválido:', imageId);
        return null;
      }

      return imageId;
    } catch (error) {
      console.error('❌ [IMAGE SERVICE] Erro ao extrair ID da imagem:', error);
      return null;
    }
  }

  /**
   * Valida se um arquivo é uma imagem válida
   * @param file - Arquivo para validar
   * @returns true se válido, string com erro se inválido
   */
  validateImageFile(file: File): true | string {
    if (!file) {
      return 'Arquivo é obrigatório';
    }

    if (!file.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 5MB';
    }

    // Validar tipos específicos se necessário
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use: JPEG, PNG ou WebP';
    }

    return true;
  }
}

// Instância singleton do serviço
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
