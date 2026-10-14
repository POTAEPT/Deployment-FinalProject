import { useAuth } from "./lib/auth";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// แอปมีหน้าเดียว (ไม่ใช้ router): ยังไม่ login แสดงหน้า Login, login แล้วแสดงหน้าหลัก
export default function App() {
  const { token } = useAuth();
  return token ? <HomePage /> : <LoginPage />;
}
