// สถานะที่ทุกหน้าที่เรียก API ต้องมี (design-system ข้อ 5): Loading / Error / Empty

export function Loading({ text = "กำลังโหลด..." }: { text?: string }) {
  return (
    <p role="status" className="text-sm font-medium">
      {text}
    </p>
  );
}

// พื้นขาวเสมอ เพื่อให้อ่านออกทั้งบนการ์ดขาวและบนพื้นสีโหมด (ตัวหนังสือแดงบนพื้นแดงจะมองไม่เห็น)
export function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-danger">
      {message}
    </p>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm opacity-80">{text}</p>;
}
