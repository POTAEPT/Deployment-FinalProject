import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, EmptyState, ErrorMessage, Loading, TextField } from "../ui";
import { ApiError, apiFetch } from "../../lib/api";
import { TASK_URL } from "../../lib/config";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type TaskListResponse = {
  status: string;
  tasks: Task[];
};

type TaskMutationResponse = {
  status: string;
  task: Task;
};

function toMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // โหลดรายการ task เมื่อเปิดหน้า
  useEffect(() => {
    let ignore = false;

    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<TaskListResponse>(`${TASK_URL}/api/tasks`);
        if (!ignore) {
          setTasks(data.tasks);
        }
      } catch (err) {
        if (!ignore) {
          setError(toMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTasks();
    return () => {
      ignore = true;
    };
  }, []);

  // เพิ่มงานใหม่: ถ้า title ว่างจะไม่ส่ง
  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed === "") return;

    setSubmitting(true);
    setError(null);
    try {
      const data = await apiFetch<TaskMutationResponse>(`${TASK_URL}/api/tasks`, {
        method: "POST",
        body: { title: trimmed },
      });
      setTasks((prev) => [...prev, data.task]);
      setTitle("");
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // สลับสถานะ completed (PATCH /api/tasks/:id)
  async function handleToggle(task: Task) {
    setError(null);
    try {
      const data = await apiFetch<TaskMutationResponse>(`${TASK_URL}/api/tasks/${task.id}`, {
        method: "PATCH",
        body: { completed: !task.completed },
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
    } catch (err) {
      setError(toMessage(err));
    }
  }

  // ลบงาน (DELETE /api/tasks/:id)
  async function handleDelete(id: string) {
    setError(null);
    try {
      await apiFetch(`${TASK_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(toMessage(err));
    }
  }

  return (
    <section className="flex flex-col gap-4" aria-label="รายการงาน">
      {/* ฟอร์มเพิ่มงานบนการ์ดขาวตาม design-system */}
      <Card>
        <form onSubmit={handleAddTask} className="flex flex-col gap-3">
          <TextField
            label="เพิ่มงานใหม่"
            placeholder="ชื่องานที่ต้องการทำ..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="filled"
              disabled={submitting || title.trim() === ""}
            >
              {submitting ? "กำลังเพิ่ม..." : "เพิ่มงาน"}
            </Button>
          </div>
        </form>
      </Card>

      {/* สถานะ Loading / Error */}
      {loading && <Loading text="กำลังโหลดรายการงาน..." />}
      {error && <ErrorMessage message={error} />}

      {/* สถานะ Empty: ยังไม่มีงาน */}
      {!loading && tasks.length === 0 && !error && (
        <EmptyState text="ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย" />
      )}

      {/* รายการ Task แต่ละการ์ด: checkbox ซ้าย ชื่อกลาง ปุ่มลบขวา */}
      {!loading && tasks.length > 0 && (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 text-ink shadow-md"
            >
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={task.completed}
                onChange={() => handleToggle(task)}
                className="h-5 w-5 cursor-pointer rounded accent-focus"
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`flex-1 cursor-pointer break-words text-base ${
                  task.completed ? "text-muted line-through" : "text-ink font-medium"
                }`}
              >
                {task.title}
              </label>
              <Button
                variant="danger"
                aria-label={`ลบงาน ${task.title}`}
                onClick={() => handleDelete(task.id)}
                className="px-3 py-1.5 text-sm"
              >
                ลบ
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
