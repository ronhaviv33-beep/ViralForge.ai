"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(222 44% 13%)",
          border: "1px solid hsl(217 33% 22%)",
          color: "hsl(210 40% 98%)",
        },
      }}
    />
  );
}
