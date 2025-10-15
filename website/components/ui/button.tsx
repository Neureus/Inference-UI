import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const variantClasses = {
      default: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-xl",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
      outline: "border-2 border-brand-600 text-brand-600 hover:bg-brand-50 bg-transparent",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      ghost: "hover:bg-gray-100 text-gray-700",
      link: "text-brand-600 underline-offset-4 hover:underline",
    }

    const sizeClasses = {
      default: "h-11 px-6 py-2.5 text-base",
      sm: "h-9 px-4 py-2 text-sm",
      lg: "h-14 px-8 py-3 text-lg",
      icon: "h-10 w-10",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
