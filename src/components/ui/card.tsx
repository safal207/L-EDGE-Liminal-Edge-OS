import React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

type CardSubComponent = React.ForwardRefExoticComponent<DivProps & React.RefAttributes<HTMLDivElement>>;

const baseClass = "rounded-2xl border bg-background text-foreground shadow-sm";

export const Card = React.forwardRef<HTMLDivElement, DivProps>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${baseClass} ${className}`.trim()} {...props} />
)) as CardSubComponent;

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 ${className}`.trim()} {...props} />
)) as CardSubComponent;

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>( 
  ({ className = "", ...props }, ref) => (
    <h3 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className}`.trim()} {...props} />
  )
);

CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`pt-0 ${className}`.trim()} {...props} />
)) as CardSubComponent;

CardContent.displayName = "CardContent";
