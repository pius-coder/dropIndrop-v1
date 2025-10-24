import React from "react";

/**
 * Product placeholder icon component
 * Replaces hard-coded SVG in ProductCard following DRY principle
 */
interface ProductPlaceholderIconProps {
  className?: string;
}

export default function ProductPlaceholderIcon({
  className = "h-8 w-8 text-muted-foreground",
}: ProductPlaceholderIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}
