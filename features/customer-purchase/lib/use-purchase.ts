/**
 * Purchase Confirmation Hook
 * Fetches article and customer data for purchase confirmation
 */

import { useQuery } from "@tanstack/react-query";
import { getArticleForPurchase } from "../api/customer-purchase-api";

export function usePurchaseConfirmation(articleId: string) {
  return useQuery({
    queryKey: ["purchase-confirmation", articleId],
    queryFn: () => getArticleForPurchase(articleId),
    enabled: !!articleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
