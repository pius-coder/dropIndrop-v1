import { IRepository } from "../../../lib/domain";
import { Image, ImageFilters, PaginationOptions } from "./image";

export interface IImageRepository extends IRepository<Image> {
  findByUploader(
    uploaderId: string,
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findPublic(
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findByIds(ids: string[]): Promise<Image[]>;
  findByCategory(
    categoryId: string,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findByTags(
    tags: string[],
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  search(
    query: string,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
  findRecent(limit?: number): Promise<Image[]>;
  findBySizeRange(
    minSize: number,
    maxSize: number,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }>;
}
