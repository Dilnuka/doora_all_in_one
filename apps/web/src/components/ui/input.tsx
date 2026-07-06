import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-doora-border bg-doora-surface-card px-4 py-2 text-sm text-doora-navy-dark placeholder:text-slate-400 focus:border-doora-orange focus:outline-none focus:ring-2 focus:ring-doora-orange-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-xl border border-doora-border bg-doora-surface-card px-4 py-3 text-sm text-doora-navy-dark placeholder:text-slate-400 focus:border-doora-orange focus:outline-none focus:ring-2 focus:ring-doora-orange-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-doora-navy", className)} {...props} />;
}
