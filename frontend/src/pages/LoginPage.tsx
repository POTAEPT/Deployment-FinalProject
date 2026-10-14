import { useState, type FormEvent } from "react";
import { Button, Card, ErrorMessage, TextField } from "../components/ui";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

// ฟอร์ม login ขั้นต่ำไว้ทดสอบ skeleton (#24)
// #25 จะทำต่อ: แท็บสมัครสมาชิก, ตรวจช่องว่าง, Loading
export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-focus p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-semibold">เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <ErrorMessage message={error} />}
          <Button type="submit">เข้าสู่ระบบ</Button>
        </form>
      </Card>
    </main>
  );
}
