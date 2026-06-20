"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { cn } from "@/lib/utils"

function Accordion({
  type = "single",
  value,
  onValueChange,
  defaultValue,
  collapsible,
  ...props
}: {
  type?: "single" | "multiple"
  value?: string[]
  onValueChange?: (value: string[]) => void
  defaultValue?: string[]
  collapsible?: boolean
  children?: React.ReactNode
  className?: string
}) {
  return (
    <AccordionPrimitive.Root
      multiple={type === "multiple"}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      {...props}
    />
  )
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { value: string }
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "mb-1 rounded-lg border border-border/40 bg-card overflow-hidden",
      className,
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h3">
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    className={cn("flex", className)}
    {...props}
  />
))
AccordionHeader.displayName = "AccordionHeader"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex flex-1 items-center justify-between px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer bg-muted/40 hover:bg-muted/60 data-[panel-open]:bg-muted/60 [&[data-panel-open]>svg]:rotate-180",
      className,
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Trigger>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Panel
    ref={ref}
    className={cn(
      "overflow-hidden data-[closed]:animate-accordion-up data-[open]:animate-accordion-down",
      className,
    )}
    {...props}
  >
    <div className="px-4 pb-3 pt-0 bg-card">{children}</div>
  </AccordionPrimitive.Panel>
))
AccordionContent.displayName = "AccordionContent"

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
}
