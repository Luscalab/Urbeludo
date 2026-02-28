
'use client';
    
import { LocalPersistence } from '@/lib/local-persistence';

/**
 * Wrapper de atualização Standalone.
 * Operações 100% síncronas com o armazenamento local do APK.
 */
export function setDocumentNonBlocking(docRef: any, data: any, options: any) {
  LocalPersistence.saveProgress(data);
}

export function addDocumentNonBlocking(colRef: any, data: any) {
  LocalPersistence.saveActivity(data);
}

export function updateDocumentNonBlocking(docRef: any, data: any) {
  LocalPersistence.saveProgress(data);
}

export function deleteDocumentNonBlocking(docRef: any) {
  // Não implementado para o MVP Standalone
}
