import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border border-accent max-w-12 aspect-square flex justify-center items-center-safe pt-2 p-0.5 rounded",
        className
      )}
    >
      <span className="text-xl font-wear-tear text-accent">dId</span>
    </div>
  );
}
