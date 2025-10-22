import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  isMobile as detectIsMobile,
  isTablet as detectIsTablet,
  isDesktop as detectIsDesktop,
  browserName,
  osName,
  deviceType,
} from 'react-device-detect';

/**
 * Interface para o retorno do hook useDevice
 */
export interface DeviceInfo {
  // Tipos de dispositivo baseados em breakpoints
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Tamanhos específicos de tela
  isSmallMobile: boolean; // <= 480px
  isMediumMobile: boolean; // 481px - 767px
  isSmallTablet: boolean; // 768px - 1023px
  isLargeTablet: boolean; // 1024px - 1279px
  isSmallDesktop: boolean; // 1280px - 1919px
  isLargeDesktop: boolean; // >= 1920px

  // Orientação
  isPortrait: boolean;
  isLandscape: boolean;

  // Informações do dispositivo (react-device-detect)
  browserName: string;
  osName: string;
  deviceType: string;

  // Utilitários
  screenWidth: number;
  screenHeight: number;

  // Detecção de touch
  isTouchDevice: boolean;

  // Breakpoint ativo atual
  currentBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

/**
 * Hook personalizado para detecção abrangente de dispositivos
 *
 * Combina react-device-detect com useMediaQuery do MUI para fornecer
 * informações completas sobre o dispositivo e viewport atual.
 *
 * Breakpoints otimizados para 50% mobile / 50% desktop:
 * - Mobile: 320px - 767px
 * - Tablet: 768px - 1023px
 * - Desktop: 1024px+
 *
 * @returns {DeviceInfo} Objeto com todas as informações do dispositivo
 */
export const useDevice = (): DeviceInfo => {
  const theme = useTheme();

  // Media queries baseadas nos breakpoints atualizados
  const isXs = useMediaQuery(theme.breakpoints.down('sm')); // 0-479px
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 480-767px
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 768-1023px
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1024-1279px
  const isXl = useMediaQuery(theme.breakpoints.between('xl', 1920)); // 1280-1919px
  const isXxl = useMediaQuery(theme.breakpoints.up(1920)); // 1920px+

  // Estados para dimensões da tela
  const [screenDimensions, setScreenDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Listener para mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determinar breakpoint atual
  const getCurrentBreakpoint = (): DeviceInfo['currentBreakpoint'] => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return 'xxl';
  };

  // Categorias principais de dispositivo
  const isMobile = isXs || isSm; // <= 767px
  const isTablet = isMd; // 768px - 1023px
  const isDesktop = isLg || isXl || isXxl; // >= 1024px

  // Detecção de touch
  const isTouchDevice =
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Orientação
  const isPortrait = screenDimensions.height > screenDimensions.width;
  const isLandscape = screenDimensions.width > screenDimensions.height;

  return {
    // Tipos principais
    isMobile,
    isTablet,
    isDesktop,

    // Tamanhos específicos
    isSmallMobile: isXs, // <= 479px
    isMediumMobile: isSm, // 480px - 767px
    isSmallTablet: isMd, // 768px - 1023px
    isLargeTablet: isLg, // 1024px - 1279px (overlap intencional para flexibilidade)
    isSmallDesktop: isLg || isXl, // 1024px - 1919px
    isLargeDesktop: isXxl, // >= 1920px

    // Orientação
    isPortrait,
    isLandscape,

    // Informações do dispositivo
    browserName,
    osName,
    deviceType,

    // Utilitários
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
    isTouchDevice,
    currentBreakpoint: getCurrentBreakpoint(),
  };
};

/**
 * Hook simplificado para casos de uso básicos
 *
 * @returns Objeto com apenas as detecções principais
 */
export const useDeviceType = () => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint } = useDevice();

  return {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
  };
};

export default useDevice;
