"use client";
import { useEffect, useState } from "react";
import {
  CircleCheck,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const html = document.documentElement;

    function readTheme(): "light" | "dark" {
      const stored = localStorage.getItem("bigset:theme");
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    setTheme(readTheme());

    // Watch data-theme attribute changes on <html>
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Also react to OS-level dark/light preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMqChange = () => setTheme(readTheme());
    mq.addEventListener("change", onMqChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onMqChange);  // ✅ cleanup added
    };
  }, []);

  return { theme };
}

function BigSetToaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      duration={4000}  // ✅ was 1000 — too short to read
      icons={{
        success: <CircleCheck className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="size-4" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--normal-border-radius": "6px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
}

export { BigSetToaster, toast };
