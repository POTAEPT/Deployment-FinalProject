import type { ButtonHTMLAttributes } from "react";
import { MODE_TEXT, type Mode } from "../../lib/mode";

type Variant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  // ใช้กับ primary: สีตัวหนังสือตามโหมดของ Timer
  mode?: Mode;
};

// คลาสตาม docs/design-system.md ข้อ 4 (ปุ่ม)
const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-white font-semibold rounded-lg px-8 py-3 shadow-md hover:opacity-90",
  secondary: "bg-white/20 text-white font-medium rounded-lg px-4 py-2 hover:bg-white/30",
  danger: "bg-danger text-white font-medium rounded-lg px-4 py-2 hover:opacity-90",
};

export function Button({
  variant = "primary",
  mode = "focus",
  type = "button",
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    VARIANT_CLASS[variant],
    variant === "primary" ? MODE_TEXT[mode] : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ].join(" ");

  return <button type={type} disabled={disabled} className={classes} {...rest} />;
}
