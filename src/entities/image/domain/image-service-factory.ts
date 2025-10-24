import { PrismaImageRepository } from "../infrastructure/image-repository";
import { ImageService, ImageServiceDependencies } from "./image-service";
import { prisma } from "../../../lib/db";

/**
 * Factory function to create ImageService with proper dependencies
 */
export function createImageService(): ImageService {
  const imageRepository = new PrismaImageRepository(prisma);

  const dependencies: ImageServiceDependencies = {
    imageRepository,
    prisma,
  };

  return new ImageService(dependencies);
}

// Export a singleton instance for convenience
export const imageService = createImageService();
