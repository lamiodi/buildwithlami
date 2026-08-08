import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-accent text-white hover:bg-accent/90 shadow-sm",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outline: "border border-gray-300 dark:border-white/20 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white",
  secondary: "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20",
  ghost: "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white",
  link: "text-accent underline-offset-4 hover:underline",
}

const buttonSizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs rounded-sm",
  lg: "h-12 px-6 text-base font-semibold",
  icon: "h-10 w-10 p-0 flex items-center justify-center",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded font-heading font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
