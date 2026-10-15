import type { Task } from "../lib/task";

export type TaskStore = {
  list(username: string): Task[];
  add(username: string, title: string): Task;
  update(username: string, id: string, changes: Partial<Pick<Task, "title" | "completed">>): Task | null;
  remove(username: string, id: string): boolean;
};

// เก็บ task ใน memory แยกตาม username (ข้อมูลหายตอน restart ตามข้อตกลง ไม่ใช้ DB)
export function createTaskStore(): TaskStore {
  const tasksByUser = new Map<string, Task[]>();
  let nextId = 1;

  function tasksOf(username: string): Task[] {
    let tasks = tasksByUser.get(username);
    if (!tasks) {
      tasks = [];
      tasksByUser.set(username, tasks);
    }
    return tasks;
  }

  return {
    list(username) {
      return [...tasksOf(username)];
    },

    add(username, title) {
      const task: Task = { id: String(nextId++), title, completed: false };
      tasksOf(username).push(task);
      return task;
    },

    // ค้นเฉพาะใน task ของ username นี้ จึงแก้ task ของคนอื่นไม่ได้ (ได้ null = 404)
    update(username, id, changes) {
      const tasks = tasksOf(username);
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return null;
      tasks[index] = { ...tasks[index], ...changes };
      return tasks[index];
    },

    remove(username, id) {
      const tasks = tasksOf(username);
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return false;
      tasks.splice(index, 1);
      return true;
    },
  };
}
