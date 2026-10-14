import fs from "node:fs";
import path from "node:path";

export type User = { username: string; passwordHash: string };

// เก็บ users เป็นไฟล์ JSON (ไม่มี Database ตามข้อกำหนด)
// ใช้คำสั่งอ่าน/เขียนไฟล์แบบ sync เพื่อให้แต่ละ request อ่าน-แก้-เขียนจบในรอบเดียว ไม่แย่งกันเขียน
export function createUserStore(usersFile: string, seedFile: string) {
  // ครั้งแรกที่ยังไม่มีไฟล์ (เช่น volume ใหม่) ให้คัดลอกบัญชีทดสอบจาก seed ถ้าไม่มี seed เริ่มจากรายการว่าง
  function ensureFile(): void {
    if (fs.existsSync(usersFile)) return;
    fs.mkdirSync(path.dirname(usersFile), { recursive: true });
    const initial = fs.existsSync(seedFile) ? fs.readFileSync(seedFile, "utf8") : "[]";
    fs.writeFileSync(usersFile, initial);
  }

  function readAll(): User[] {
    ensureFile();
    return JSON.parse(fs.readFileSync(usersFile, "utf8")) as User[];
  }

  function findByUsername(username: string): User | undefined {
    return readAll().find((user) => user.username === username);
  }

  // คืน false ถ้า username ซ้ำ (route จะตอบ 409)
  function add(user: User): boolean {
    const users = readAll();
    if (users.some((u) => u.username === user.username)) return false;
    users.push(user);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  }

  return { ensureFile, findByUsername, add };
}

export type UserStore = ReturnType<typeof createUserStore>;
