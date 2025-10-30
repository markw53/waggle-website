// Toast.tsx
import * as React from "react"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose
} from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

const ToastContainer: React.FC<React.PropsWithChildren<object>> = ({ children }) => (
  <ToastProvider swipeDirection="right">
    {children}
    <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-96 z-50 outline-none" />
  </ToastProvider>
)

const CustomToast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  React.ComponentPropsWithoutRef<typeof Toast>
>(({ className, ...props }, ref) => (
  <Toast
    ref={ref}
    className={cn("bg-background border p-4 rounded-md shadow-lg flex flex-col gap-1", className)}
    {...props}
  />
))
CustomToast.displayName = "CustomToast"

export { ToastContainer, CustomToast, ToastTitle, ToastDescription, ToastClose }