import { resourceById } from "@/lib/resources";
import type { PlannedTask } from "@/lib/types";

export function openTask(task: PlannedTask, push: (href: string) => void) {
  if (task.href?.startsWith("/#")) {
    const id = task.href.slice(2);
    if (window.location.pathname !== "/") {
      push(`/${task.href.slice(1)}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (task.href) {
    push(task.href);
    return;
  }
  const resource = resourceById(task.resourceId);
  if (!resource) return;
  if (resource.internal) push(resource.url);
  else window.open(resource.url, "_blank", "noopener,noreferrer");
}
