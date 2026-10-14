import { useState, type FormEvent } from "react";
import { Button, Card, ErrorMessage, TextField } from "../components/ui";
import { ApiError, apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { AUTH_URL } from "../lib/config";

type Tab = "login" | "register";

type FieldErrors = { username?: string; password?: string; confirm?: string };

const TAB_LABEL: Record<Tab, string> = { login: "เข้าสู่ระบบ", register: "สมัครสมาชิก" };

// ตรวจช่องกรอกก่อนส่ง ถ้ายังมี error จะไม่ยิง API
function validate(tab: Tab, username: string, password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {};
  if (username.trim() === "") errors.username = "กรุณากรอก username";
  if (password === "") errors.password = "กรุณากรอกรหัสผ่าน";
  if (tab === "register" && password !== "" && confirm !== password) {
    errors.confirm = "รหัสผ่านไม่ตรงกัน";
  }
  return errors;
}

// แปลง error เป็นข้อความที่แสดงให้ผู้ใช้ (ApiError มี message จาก API อยู่แล้ว)
function toMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
}

export default function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchTab(next: Tab) {
    setTab(next);
    setConfirm("");
    setFieldErrors({});
    setApiError(null);
    setInfo(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setInfo(null);

    const errors = validate(tab, username, password, confirm);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      if (tab === "register") {
        await apiFetch(`${AUTH_URL}/api/auth/register`, {
          method: "POST",
          body: { username, password },
        });
        // สมัครสำเร็จแล้ว login ให้เลย ไม่ต้องกรอกซ้ำ
        try {
          await login(username, password);
        } catch {
          switchTab("login");
          setInfo("สมัครสำเร็จ กรุณาเข้าสู่ระบบ");
        }
      } else {
        // login สำเร็จ App จะสลับไปหน้าหลักเอง (component นี้หายไป)
        await login(username, password);
      }
    } catch (err) {
      setApiError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-focus p-4">
      <h1 className="text-2xl font-semibold text-white">Pomodoro</h1>
      <Card className="w-full max-w-md">
        <div className="mb-6 grid grid-cols-2 gap-2">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => switchTab(t)}
              disabled={loading}
              className={`rounded-lg px-4 py-2 font-medium ${
                tab === t ? "bg-focus text-white" : "text-muted hover:bg-line"
              }`}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            autoComplete="username"
            autoFocus
            disabled={loading}
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            disabled={loading}
          />
          {tab === "register" && (
            <TextField
              label="ยืนยันรหัสผ่าน"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={fieldErrors.confirm}
              autoComplete="new-password"
              disabled={loading}
            />
          )}

          {info && <p className="text-sm font-medium text-success">{info}</p>}
          {apiError && <ErrorMessage message={apiError} />}

          <Button type="submit" variant="filled" disabled={loading}>
            {loading ? "กำลังโหลด..." : TAB_LABEL[tab]}
          </Button>
        </form>
      </Card>
    </main>
  );
}
