/**
 * Customer Purchase API
 * Handles purchase-related operations for customers
 */

import type { ArticleWithRelations } from "@/entities/article";

/**
 * Get article data for purchase confirmation
 */
export async function getArticleForPurchase(articleId: string): Promise<{
  article: ArticleWithRelations;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}> {
  const response = await fetch(`/api/purchase/article/${articleId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Article not found");
    }
    if (response.status === 401) {
      throw new Error("Authentication required");
    }
    throw new Error("Failed to fetch article for purchase");
  }

  return response.json();
}

/**
 * Get order details for success page
 */
export async function getOrderDetails(orderId: string): Promise<{
  order: any;
  article: any;
}> {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("customerToken")}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Order not found");
    }
    if (response.status === 401) {
      throw new Error("Authentication required");
    }
    throw new Error("Failed to fetch order details");
  }

  return response.json();
}
