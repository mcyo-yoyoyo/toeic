import { resourceById } from "@/lib/resources";
import type { Category, PlannedTask, Reason, Unit } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  vocabulary: "词汇",
  grammar: "语法",
  part5: "Part 5",
  part6: "Part 6",
  part7: "Part 7",
  mock: "模考",
  review: "错题",
  baseline: "基线",
};

export const REASON_LABEL: Record<Reason, string> = {
  vocabulary: "词汇",
  grammar: "语法",
  comprehension: "读不懂",
  careless: "看错",
  time: "时间不够",
};

export const REASONS = Object.keys(REASON_LABEL) as Reason[];

export const TAGS = [
  "词形",
  "时态",
  "介词",
  "连词",
  "代词",
  "主谓一致",
  "比较",
  "关系词",
  "定位",
  "同义替换",
  "主旨",
  "推断",
  "跨文档",
];

export function quantityText(quantity: number, unit: Unit): string {
  switch (unit) {
    case "words":
      return `${quantity} 个词`;
    case "questions":
      return `${quantity} 题`;
    case "passages":
      return `${quantity} 篇`;
    case "mistakes":
      return `${quantity} 条错题`;
    case "sets":
      return `${quantity} 套`;
    default:
      return "";
  }
}

export function actionLabel(task: PlannedTask): string {
  const resource = resourceById(task.resourceId);
  if (task.href === "/#baseline") return "去填写";
  if (task.href === "/roadmap") return "看路线";
  if (task.href === "/mistakes" || task.category === "review") return "去复习";
  if (resource?.internal && task.category === "vocabulary") return "打开词表";
  if (resource?.internal) return "在这里做";
  if (task.category === "baseline") return "打开官方样题";
  if (task.category === "mock") return "打开官方样题";
  return "开始练习";
}

export function pct(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}
