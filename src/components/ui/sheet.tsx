"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Sheet({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/20 duration-200 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

const SHEET_SIDE_CONFIG = {
  right: {
    position: "fixed top-0 right-0 h-full",
    size: "w-[420px] max-w-[calc(100vw-2rem)]",
    slideIn: "data-open:slide-in-from-right",
    slideOut: "data-closed:slide-out-to-right",
  },
  left: {
    position: "fixed top-0 left-0 h-full",
    size: "w-[420px] max-w-[calc(100vw-2rem)]",
    slideIn: "data-open:slide-in-from-left",
    slideOut: "data-closed:slide-out-to-left",
  },
  top: {
    position: "fixed top-0 left-0 right-0",
    size: "max-h-[85vh]",
    slideIn: "data-open:slide-in-from-top",
    slideOut: "data-closed:slide-out-to-top",
  },
  bottom: {
    position: "fixed bottom-0 left-0 right-0",
    size: "max-h-[85vh]",
    slideIn: "data-open:slide-in-from-bottom",
    slideOut: "data-closed:slide-out-to-bottom",
  },
} as const;

type SheetSide = keyof typeof SHEET_SIDE_CONFIG;

function SheetContent({
  side = "right",
  className,
  children,
  showCloseButton = true,
  ...props
}: DrawerPrimitive.Popup.Props & {
  side?: SheetSide;
  showCloseButton?: boolean;
}) {
  const config = SHEET_SIDE_CONFIG[side];

  return (
    <SheetPortal>
      <SheetOverlay />
      <DrawerPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          config.position,
          config.size,
          "z-50 flex flex-col bg-card shadow-[var(--shadow-4)] ring-1 ring-foreground/10 duration-200 outline-none",
          config.slideIn,
          config.slideOut,
          "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          className,
        )}
        {...props}
      >
        <DrawerPrimitive.Viewport className="flex-1 overflow-y-auto">
          {children}
        </DrawerPrimitive.Viewport>
        {showCloseButton && (
          <DrawerPrimitive.Close
            data-slot="sheet-close-button"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2 cursor-pointer"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DrawerPrimitive.Close>
        )}
      </DrawerPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2 px-5 pt-5 pb-3", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col-reverse gap-2 border-t bg-muted/50 px-5 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base leading-none font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
