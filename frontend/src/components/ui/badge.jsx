import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-accent/15 text-accent border-accent/20",
  secondary: "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-transparent",
  outline: "text-gray-900 dark:text-white border-gray-300 dark:border-white/20",
  destructive: "bg-red-500/15 text-red-500 border-red-500/20",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
