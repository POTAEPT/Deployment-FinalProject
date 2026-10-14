import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  // solid = การ์ดขาว ตัวหนังสือ ink | glass = โปร่งแสงบนพื้นสีโหมด ตัวหนังสือขาว (เช่น การ์ด Timer)
  variant?: "solid" | "glass";
};

const VARIANT_CLASS = {
  solid: "bg-white text-ink shadow-md",
  glass: "bg-white/10 text-white",
};

export function Card({ variant = "solid", className = "", ...rest }: CardProps) {
  return <div className={`${VARIANT_CLASS[variant]} rounded-xl p-6 ${className}`} {...rest} />;
}
