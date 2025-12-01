import React from "react";

type BadgeVariant = "default" | "outline" | "destructive";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-input bg-background text-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const styles = variantClasses[variant] ?? variantClasses.default;

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${styles} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
