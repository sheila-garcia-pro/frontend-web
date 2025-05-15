import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce em valores que mudam frequentemente
 * @param value O valor que será debounced
 * @param delay Tempo de atraso em milissegundos (padrão: 500ms)
 * @returns O valor após o período de debounce
 */
export function useDebounce<T>(value: T, delay = 500): T {
  // Estado para armazenar o valor debounced
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura um timer para atualizar o valor debounced após o atraso
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar antes do delay terminar
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 