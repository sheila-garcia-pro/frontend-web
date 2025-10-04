import api from './api';

export interface ImageUploadResponse {
  url: string;
  success: boolean;
  message?: string;
}

export interface ImageDeleteResponse {
  success: boolean;
  message?: string;
}

export type ImageUploadType = 'ingredients' | 'recipes' | 'users';

class ImageUploadService {
  /**
   * Upload de imagem inteligente - usa POST para primeira imagem, PATCH para substituição
   * @param file - Arquivo de imagem
   * @param type - Tipo de upload (ingredients, recipes, users)
   * @param currentImageUrl - URL da imagem atual (para PATCH) ou null (para POST)
   * @returns Promise com a URL da nova imagem
   */
  async uploadImage(
    file: File,
    type: ImageUploadType,
    currentImageUrl: string | null = null,
  ): Promise<ImageUploadResponse> {
    try {
      // Validar arquivo
      const validation = this.validateImageFile(file);
      if (validation !== true) {
        throw new Error(validation);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      let response;
      const hasCurrentImage = !!(currentImageUrl && currentImageUrl.trim() !== '');

      if (hasCurrentImage) {
        formData.append('imageRemoveUrl', currentImageUrl);

        response = await api.patch<{ url: string }>('/v1/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post<{ url: string }>('/v1/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data?.url) {
        return {
          url: response.data.url,
          success: true,
          message: hasCurrentImage
            ? 'Imagem atualizada com sucesso!'
            : 'Imagem enviada com sucesso!',
        };
      } else {
        throw new Error('URL não retornada pela API');
      }
    } catch (error: any) {
      return {
        url: '',
        success: false,
        message: this.extractErrorMessage(error),
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
      if (!imageUrl || imageUrl.trim() === '') {
        return { success: true, message: 'Nenhuma imagem para deletar' };
      }

      await api.delete('/v1/upload/image', {
        params: { url: imageUrl },
      });

      return {
        success: true,
        message: 'Imagem deletada com sucesso',
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'Imagem já foi removida do servidor',
        };
      }

      return {
        success: false,
        message: this.extractErrorMessage(error),
      };
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

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use: JPEG, PNG ou WebP';
    }

    return true;
  }

  /**
   * Extrai mensagem de erro de forma consistente
   * @param error - Objeto de erro
   * @returns Mensagem de erro formatada
   */
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return Array.isArray(error.response.data.message)
        ? error.response.data.message[0]
        : error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return 'Erro inesperado';
  }
}

// Instância singleton do serviço
const imageUploadService = new ImageUploadService();
export default imageUploadService;
