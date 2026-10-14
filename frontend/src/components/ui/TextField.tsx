import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  // ข้อความ error ใต้ช่อง (ไม่ส่ง = ไม่แสดง)
  error?: string;
};

// ช่องกรอกตาม design-system ข้อ 4 (ฟอร์ม): label อยู่บน ผูกกับ input ด้วย id
export function TextField({ label, error, className = "", ...rest }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border border-line px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-focus ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
