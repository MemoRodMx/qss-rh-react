"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AlertDialog = Dialog

const AlertDialogTrigger = DialogTrigger

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn("sm:max-w-md", className)}
    {...props}
  />
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = DialogHeader

const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <DialogFooter ref={ref} className={cn(className)} {...props}>
    {children}
    <DialogClose render={<Button variant="outline" />}>
      Cancelar
    </DialogClose>
  </DialogFooter>
))
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = DialogTitle

const AlertDialogDescription = DialogDescription

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
  <DialogClose
    render={
      <Button
        ref={ref}
        variant="outline"
        className={cn("cursor-pointer", className)}
        {...props}
      />
    }
  />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
