import { FilesClientService } from '@src/modules/files/infrastructure/files.client';

export interface CleanupImage {
  id: number;
  key: string;
}

export interface RepositoryForCleanup {
  markAsDeleted(ids: number[]): Promise<unknown>;
}

export async function cleanupImages(
  images: CleanupImage[],
  repository: RepositoryForCleanup,
  filesClient: FilesClientService,
) {
  if (!images.length) return;

  const keys = images.map(img => img.key);
  
  try {
    const result = await filesClient.delete(keys);

    const successSet = new Set(result.success);
    const successIds: number[] = [];

    for (const img of images) {
      if (successSet.has(img.key)) successIds.push(img.id);
    }

    if (successIds.length) {
      await repository.markAsDeleted(successIds);
    }
  } catch (e) {
    console.error('Images cleanup failed', {
      error: e,
      imageIds: images.map(img => img.id),
    });
  }
}