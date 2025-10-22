// src/utils/mobileUtils.ts

/**
 * Detect if running on mobile device
 */
export const isMobile = (): boolean => {
  const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
  return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent);
};
