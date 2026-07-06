import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-doora-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-doora-orange text-white shadow-md shadow-doora-orange/20 hover:bg-doora-orange-dark",
        secondary:
          "border border-doora-border bg-doora-surface-card text-doora-navy hover:bg-doora-surface",
        outline:
          "border border-doora-border bg-transparent text-doora-navy hover:bg-doora-surface",
        ghost: "text-doora-navy hover:bg-doora-surface",
        danger: "bg-red-500 text-white hover:bg-red-600",
        navy: "bg-doora-navy text-white hover:bg-doora-navy-light",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
