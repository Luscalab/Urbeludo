'use client';
/**
 * @fileOverview AuraBrain - Arquivo simplificado.
 * Removida lógica de Web Workers para priorizar performance no APK.
 */

export const initAuraBrain = () => {
  // Desativado para performance
};

export const classifyIntent = async (): Promise<string> => {
  return 'fallback';
};
