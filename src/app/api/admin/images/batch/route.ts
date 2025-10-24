import { NextRequest, NextResponse } from "next/server";
import { imageService } from "../../../../../entities/image/domain/image-service-factory";
import { authMiddleware } from "../../../../../lib/middleware/auth-middleware";
import { UserRole } from "@prisma/client";
import { BatchImageOperationSchema } from "../../../../../lib/schemas/image-schema";

/**
 * POST /api/admin/images/batch
 * Perform batch operations on multiple images
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If middleware returned an error response, return it
    if (authResult.response) {
      return authResult.response;
    }

    // User is authenticated and has required role
    const user = authResult.user;

    const body = await request.json();
    const { imageIds, operation } = body;

    // Validate input data
    const validationResult = BatchImageOperationSchema.safeParse({
      imageIds,
      operation,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;
    let results = [];
    let successCount = 0;
    let failureCount = 0;

    // Perform batch operations
    for (const imageId of validData.imageIds) {
      try {
        let result;

        switch (validData.operation) {
          case "delete":
            result = await imageService.deleteImage(imageId, user!.id);
            break;
          case "activate":
            result = await imageService.activate(imageId);
            break;
          case "deactivate":
            result = await imageService.deactivate(imageId);
            break;
          case "makePublic":
            result = await imageService.update(imageId, { isPublic: true });
            break;
          case "makePrivate":
            result = await imageService.update(imageId, { isPublic: false });
            break;
          default:
            result = {
              success: false,
              error: new Error(`Unsupported operation: ${validData.operation}`),
            };
        }

        results.push({
          imageId,
          success: result.success,
          error: result.success ? null : result.error?.message,
        });

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error: any) {
        results.push({
          imageId,
          success: false,
          error: error.message,
        });
        failureCount++;
      }
    }

    // Log batch operation
    console.log(
      `Batch operation '${validData.operation}' completed: ${successCount} success, ${failureCount} failed`
    );

    return NextResponse.json({
      success: true,
      data: {
        operation: validData.operation,
        totalProcessed: validData.imageIds.length,
        successCount,
        failureCount,
        results,
      },
    });
  } catch (error) {
    console.error("Error performing batch operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
