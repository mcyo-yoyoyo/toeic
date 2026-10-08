export type ResourceGroup = "official" | "vocabulary" | "practice" | "admin" | "offline";

export interface Resource {
  id: string;
  title: string;
  provider: string;
  type: string;
  why: string;
  url: string;
  priority: "primary" | "secondary";
  group: ResourceGroup;
  radar: "latest" | "recommended" | "optional" | "none";
  internal?: boolean;
}

/**
 * External links are China-facing official pages.
 * In-app drills live in src/lib/offline.ts and ship with the repo.
 * Official test items are not copied here.
 */
export const RESOURCES: Resource[] = [
  {
    id: "cn-home",
    title: "ETS 托业中国官网",
    provider: "ETS 托业中国",
    type: "报名 / 考试信息",
    why: "中国大陆公开考试的报名、城市和通知以这个网站为准。",
    url: "https://www.test-toeic.cn/",
    priority: "primary",
    group: "official",
    radar: "recommended",
  },
  {
    id: "cn-schedule",
    title: "2026 年大陆听读考试日程",
    provider: "ETS 托业中国",
    type: "报名",
    why: "10 月 25 日、11 月 22 日、12 月 20 日三场听读公开考试，以及常规和加急报名截止日。日期若有变动，以这一页为准。",
    url: "https://www.test-toeic.cn/aboutExam.aspx?id=29",
    priority: "primary",
    group: "admin",
    radar: "latest",
  },
  {
    id: "ets-prepare",
    title: "ETS 全球官方备考",
    provider: "ETS",
    type: "样题 / 考生手册",
    why: "题型结构全球一致。基线用这里的官方样题，报名仍回大陆官网。",
    url: "https://www.ets.org/toeic/test-takers/prepare.html",
    priority: "primary",
    group: "official",
    radar: "recommended",
  },
  {
    id: "ets-about",
    title: "Listening & Reading 题型说明",
    provider: "ETS",
    type: "考试结构",
    why: "Part 5 共 30 题，Part 6 共 16 题，Part 7 共 54 题，阅读 75 分钟。",
    url: "https://www.ets.org/toeic/test-takers/about/listening-reading.html",
    priority: "secondary",
    group: "official",
    radar: "optional",
  },
  {
    id: "offline-vocab",
    title: "门户词表",
    provider: "本门户",
    type: "离线词汇",
    why: "商务词随仓库放在本地，断网也能翻。这是自编词表，不是官方 1,800 词原书。",
    url: "/practice/vocab",
    priority: "primary",
    group: "offline",
    radar: "recommended",
    internal: true,
  },
  {
    id: "offline-part5",
    title: "门户 Part 5",
    provider: "本门户",
    type: "离线练习",
    why: "句子填空，做完能看考点。用来建立手感，不代替官方样题。",
    url: "/practice/part5",
    priority: "primary",
    group: "offline",
    radar: "recommended",
    internal: true,
  },
  {
    id: "offline-part6",
    title: "门户 Part 6",
    provider: "本门户",
    type: "离线练习",
    why: "先读完一段通知或邮件，再填空。",
    url: "/practice/part6",
    priority: "primary",
    group: "offline",
    radar: "recommended",
    internal: true,
  },
  {
    id: "offline-part7",
    title: "门户 Part 7 单篇",
    provider: "本门户",
    type: "离线练习",
    why: "单篇阅读：定位、目的和推断。",
    url: "/practice/part7",
    priority: "primary",
    group: "offline",
    radar: "recommended",
    internal: true,
  },
  {
    id: "offline-part7-multi",
    title: "门户 Part 7 双篇",
    provider: "本门户",
    type: "离线练习",
    why: "两份文件对上号。先看每份是什么，再做跨文档的题。",
    url: "/practice/part7-multi",
    priority: "primary",
    group: "offline",
    radar: "recommended",
    internal: true,
  },
  {
    id: "offline-diagnostic",
    title: "开课诊断",
    provider: "本门户",
    type: "短诊断",
    why: "没有完整阅读卷时，用 10 道句子、1 篇 Part 6 和 1 篇 Part 7 看起点。这不是官方分数。",
    url: "/practice/diagnostic",
    priority: "primary",
    group: "offline",
    radar: "recommended",
    internal: true,
  },
  {
    id: "offline-mock",
    title: "门户短模考",
    provider: "本门户",
    type: "离线练习",
    why: "把词、句子和短文接在一起过一遍。完整 100 题仍用官方样题。",
    url: "/practice",
    priority: "secondary",
    group: "offline",
    radar: "optional",
    internal: true,
  },
  {
    id: "internal-mistakes",
    title: "我的错题",
    provider: "本门户",
    type: "错题本",
    why: "外部题库没有你的错因。复习以这里的记录为准。",
    url: "/mistakes",
    priority: "primary",
    group: "practice",
    radar: "none",
    internal: true,
  },
];

const LEGACY: Record<string, string> = {
  "iibc-vocab": "offline-vocab",
  "iibc-app": "offline-part5",
  "iibc-reading": "offline-part7",
  "iibc-book13": "ets-prepare",
  "iibc-schedule": "cn-schedule",
  "iibc-support": "cn-home",
  "iibc-prep": "cn-home",
};

export function resourceById(id: string): Resource | undefined {
  return RESOURCES.find((item) => item.id === (LEGACY[id] ?? id));
}

export function hubResources(): Resource[] {
  return RESOURCES.filter((item) => item.id !== "internal-mistakes");
}

export function radar() {
  const latest = resourceById("cn-schedule");
  const recommended = hubResources().filter((item) => item.radar === "recommended");
  const optional = hubResources().filter((item) => item.radar === "optional");
  return { latest, recommended, optional };
}
