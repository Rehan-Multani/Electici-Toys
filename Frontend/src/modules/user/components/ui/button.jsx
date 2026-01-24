import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-premium hover:shadow-premium-hover hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                glass: "glass hover:glass-dark text-foreground border-white/20 hover:border-white/40 shadow-glass",
            },
            size: {
                default: "h-11 px-8 py-2",
                sm: "h-9 rounded-full px-4 text-xs",
                lg: "h-14 rounded-full px-12 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, premium = false, ...props }, ref) => {
    if (asChild) {
        return (
            <Slot
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }

    const motionProps = {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 15 }
    }

    return (
        <motion.button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...motionProps}
            {...props}
        >

            <span className="relative z-10 flex items-center gap-2">
                {props.children}
            </span>
        </motion.button>
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
