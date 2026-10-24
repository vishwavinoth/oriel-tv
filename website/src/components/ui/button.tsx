import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap no-underline",
    "transition-[transform,box-shadow,background-color,border-color] duration-(--o-duration-base) ease-standard",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-on-accent shadow-[0_10px_30px_color-mix(in_srgb,var(--o-color-accent)_32%,transparent)] hover:shadow-[0_14px_40px_color-mix(in_srgb,var(--o-color-accent)_48%,transparent)]",
        // A floating control over imagery: clear glass (ADR 0004 and ADR 0005).
        glass: "glass-clear text-fg hover:border-fg/35",
        quiet: "border border-border text-fg hover:bg-surface-hover",
        ghost: "text-fg-2 hover:bg-fg/8 hover:text-fg",
      },
      size: {
        md: "min-h-12 px-6 text-callout",
        sm: "min-h-10 px-4 text-callout",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

/** A button, or with `asChild`, a link or other element styled as one. */
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
