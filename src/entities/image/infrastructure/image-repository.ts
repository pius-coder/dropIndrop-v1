import { PrismaClient } from "@prisma/client";
import { IImageRepository } from "../domain/image-repository";
import { Image, ImageFilters, PaginationOptions } from "../domain/image";
import { BaseEntity } from "../../../lib/domain";

export class PrismaImageRepository implements IImageRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Image | null> {
    const record = await this.prisma.image.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findMany(criteria?: Partial<Image>): Promise<Image[]> {
    const records = await this.prisma.image.findMany({
      where: criteria ? this.buildWhereClause(criteria) : {},
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return records.map((record) => this.mapToDomain(record));
  }

  async create(entity: Omit<Image, keyof BaseEntity>): Promise<Image> {
    const record = await this.prisma.image.create({
      data: {
        title: entity.title,
        altText: entity.altText,
        url: entity.url,
        thumbUrl: entity.thumbUrl,
        deleteUrl: entity.deleteUrl,
        filename: entity.filename,
        originalName: entity.originalName,
        size: entity.size,
        mimeType: entity.mimeType,
        width: entity.width,
        height: entity.height,
        uploadedBy: entity.uploadedBy,
        categoryId: entity.category?.id,
        tags: entity.tags,
        isPublic: entity.isPublic,
        isActive: entity.isActive,
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToDomain(record);
  }

  async update(id: string, data: Partial<Image>): Promise<Image> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.altText !== undefined) updateData.altText = data.altText;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const record = await this.prisma.image.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToDomain(record);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.image.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByUploader(
    uploaderId: string,
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }> {
    const where: any = {
      uploadedBy: uploaderId,
      isActive: true,
    };

    if (filters) {
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }
      if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
      if (filters.mimeType) where.mimeType = filters.mimeType;
      if (filters.minSize || filters.maxSize) {
        where.size = {};
        if (filters.minSize) where.size.gte = filters.minSize;
        if (filters.maxSize) where.size.lte = filters.maxSize;
      }
      if (filters.createdAfter) where.createdAt = { gte: filters.createdAfter };
      if (filters.createdBefore)
        where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { altText: { contains: filters.search, mode: "insensitive" } },
          { filename: { contains: filters.search, mode: "insensitive" } },
          { originalName: { contains: filters.search, mode: "insensitive" } },
        ];
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(pagination),
        skip: pagination
          ? (pagination.page! - 1) * pagination.limit!
          : undefined,
        take: pagination?.limit,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images: records.map((record) => this.mapToDomain(record)),
      total,
    };
  }

  async findPublic(
    filters?: ImageFilters,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }> {
    const where: any = {
      isPublic: true,
      isActive: true,
    };

    if (filters) {
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }
      if (filters.mimeType) where.mimeType = filters.mimeType;
      if (filters.minSize || filters.maxSize) {
        where.size = {};
        if (filters.minSize) where.size.gte = filters.minSize;
        if (filters.maxSize) where.size.lte = filters.maxSize;
      }
      if (filters.createdAfter) where.createdAt = { gte: filters.createdAfter };
      if (filters.createdBefore)
        where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { altText: { contains: filters.search, mode: "insensitive" } },
          { filename: { contains: filters.search, mode: "insensitive" } },
          { originalName: { contains: filters.search, mode: "insensitive" } },
        ];
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(pagination),
        skip: pagination
          ? (pagination.page! - 1) * pagination.limit!
          : undefined,
        take: pagination?.limit,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images: records.map((record) => this.mapToDomain(record)),
      total,
    };
  }

  async findByIds(ids: string[]): Promise<Image[]> {
    const records = await this.prisma.image.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return records.map((record) => this.mapToDomain(record));
  }

  async findByCategory(
    categoryId: string,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }> {
    const where = {
      categoryId,
      isActive: true,
    };

    const [records, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(pagination),
        skip: pagination
          ? (pagination.page! - 1) * pagination.limit!
          : undefined,
        take: pagination?.limit,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images: records.map((record) => this.mapToDomain(record)),
      total,
    };
  }

  async findByTags(
    tags: string[],
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }> {
    const where = {
      tags: { hasSome: tags },
      isActive: true,
    };

    const [records, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(pagination),
        skip: pagination
          ? (pagination.page! - 1) * pagination.limit!
          : undefined,
        take: pagination?.limit,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images: records.map((record) => this.mapToDomain(record)),
      total,
    };
  }

  async search(
    query: string,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }> {
    const where = {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { altText: { contains: query, mode: "insensitive" as const } },
            { filename: { contains: query, mode: "insensitive" as const } },
            { originalName: { contains: query, mode: "insensitive" as const } },
            { tags: { has: query } },
          ],
        },
        { isActive: true },
      ],
    };

    const [records, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(pagination),
        skip: pagination
          ? (pagination.page! - 1) * pagination.limit!
          : undefined,
        take: pagination?.limit,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images: records.map((record) => this.mapToDomain(record)),
      total,
    };
  }

  async findRecent(limit: number = 10): Promise<Image[]> {
    const records = await this.prisma.image.findMany({
      where: {
        isActive: true,
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return records.map((record) => this.mapToDomain(record));
  }

  async findBySizeRange(
    minSize: number,
    maxSize: number,
    pagination?: PaginationOptions
  ): Promise<{ images: Image[]; total: number }> {
    const where = {
      size: {
        gte: minSize,
        lte: maxSize,
      },
      isActive: true,
    };

    const [records, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(pagination),
        skip: pagination
          ? (pagination.page! - 1) * pagination.limit!
          : undefined,
        take: pagination?.limit,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images: records.map((record) => this.mapToDomain(record)),
      total,
    };
  }

  private mapToDomain(record: any): Image {
    return new Image(
      record.id,
      record.title,
      record.altText,
      record.url,
      record.thumbUrl,
      record.deleteUrl,
      record.filename,
      record.originalName,
      record.size,
      record.mimeType,
      record.width,
      record.height,
      record.uploadedBy,
      record.category,
      record.tags,
      record.isPublic,
      record.isActive,
      record.createdAt,
      record.updatedAt
    );
  }

  private buildWhereClause(criteria: Partial<Image>): any {
    const where: any = {};

    if (criteria.title) where.title = criteria.title;
    if (criteria.altText) where.altText = criteria.altText;
    if (criteria.url) where.url = criteria.url;
    if (criteria.filename) where.filename = criteria.filename;
    if (criteria.originalName) where.originalName = criteria.originalName;
    if (criteria.size) where.size = criteria.size;
    if (criteria.mimeType) where.mimeType = criteria.mimeType;
    if (criteria.width) where.width = criteria.width;
    if (criteria.height) where.height = criteria.height;
    if (criteria.uploadedBy) where.uploadedBy = criteria.uploadedBy;
    if (criteria.category) where.categoryId = criteria.category.id;
    if (criteria.tags) where.tags = { hasSome: criteria.tags };
    if (criteria.isPublic !== undefined) where.isPublic = criteria.isPublic;
    if (criteria.isActive !== undefined) where.isActive = criteria.isActive;

    return where;
  }

  private buildOrderBy(pagination?: PaginationOptions) {
    if (!pagination?.orderBy) {
      return { createdAt: "desc" as const };
    }

    const direction = pagination.orderDirection || "desc";
    return { [pagination.orderBy]: direction as "asc" | "desc" };
  }
}
