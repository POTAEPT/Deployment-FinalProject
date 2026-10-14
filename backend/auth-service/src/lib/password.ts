import bcrypt from "bcryptjs";

// จำนวนรอบที่ bcrypt ใช้สร้าง hash ยิ่งมากยิ่งเดายาก แต่ก็ช้าลง (10 เป็นค่ามาตรฐาน)
const SALT_ROUNDS = 10;

// แปลงรหัสผ่านเป็น hash ก่อนเก็บลงไฟล์ (ไม่เก็บรหัสผ่านจริง)
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// เทียบรหัสผ่านที่ผู้ใช้พิมพ์กับ hash ที่เก็บไว้
export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
