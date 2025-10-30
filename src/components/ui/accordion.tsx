// Accordion.tsx
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionPrimitive.AccordionItemProps>(
  ({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-gray-200", className)}
      {...props}
    />
  )
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionPrimitive.AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        {...props}
      >
        {children}
        <span className="ml-2">▾</span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionPrimitive.AccordionContentProps>(
  ({ className, ...props }, ref) => (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn("overflow-hidden text-sm transition-all", className)}
      {...props}
    />
  )
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
