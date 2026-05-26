import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition " +
  "border focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 " +
  "disabled:opacity-60 disabled:cursor-not-allowed select-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 " +
    "text-white border-white/10 shadow-md",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 shadow-sm",
  ghost:
    "bg-transparent hover:bg-zinc-800/60 text-zinc-100 border-transparent",
  danger:
    "bg-zinc-900 hover:bg-red-950/40 text-red-300 border-red-500/30",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

