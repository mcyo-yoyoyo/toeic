import {
  addDays,
  dateForDay,
  EARLY_EXAM,
  EXAM_DATE,
  programDay,
  PROGRAM_END,
  PROGRAM_START,
} from "./dates";
import type { DayPlan, ExamChoice, PlannedTask } from "./types";

export const WEEK_META = [
  {
    week: 0,
    title: "基线",
    dates: "10/8 – 10/11",
    aim: "找到真实起点",
    detail: "有完整阅读卷就记下三个 Part 的正确数。没有完整卷就做门户里的开课诊断，那是短诊断，不是官方分数。",
  },
  {
    week: 1,
    title: "词汇 + 基础语法",
    dates: "10/12 – 10/18",
    aim: "把认识英语和会做题分开",
    detail: "先立高频词，以及直接决定 Part 5 的词性、一致和时态。",
  },
  {
    week: 2,
    title: "语法 + Part 5",
    dates: "10/19 – 10/25",
    aim: "看见空格就知道考点",
    detail: "介词、连词和 Part 5 判断。这周不做整套计时。",
  },
  {
    week: 3,
    title: "Part 5 正确率",
    dates: "10/26 – 11/1",
    aim: "稳定到 80% 以上",
    detail: "这是最容易把 Reading 拉开的一周。达不到 80%，就不把时间让给文章。",
  },
  {
    week: 4,
    title: "Part 6 语境",
    dates: "11/2 – 11/8",
    aim: "整段读完再填空",
    detail: "Part 6 不是拆开的 Part 5。先读完整段，再看空格前后和句与句的关系。",
  },
  {
    week: 5,
    title: "Part 7 单篇",
    dates: "11/9 – 11/15",
    aim: "一次只练一种阅读技能",
    detail: "事实、同义替换、主旨、目的、推断分开练。",
  },
  {
    week: 6,
    title: "Part 7 双篇 / 多篇",
    dates: "11/16 – 11/22",
    aim: "两份文件对上号",
    detail: "跨文档题必须两边都看到。只读一篇就选，几乎一定错。",
  },
  {
    week: 7,
    title: "速度",
    dates: "11/23 – 11/29",
    aim: "把 Reading 放进 75 分钟",
    detail: "Part 5 目标 10–12 分钟，Part 6 目标 8–10 分钟，剩下的时间全部给 Part 7。",
  },
  {
    week: 8,
    title: "模拟 + 补弱",
    dates: "11/30 – 12/6",
    aim: "整套做完，只补最弱的一类",
    detail: "12 月 6 日做第一次完整阅读计时。这不是大陆公开考试日。",
  },
  {
    week: 9,
    title: "缓冲",
    dates: "12/7 – 12/31",
    aim: "模考、补弱、上场",
    detail: "目标考试日是 12 月 20 日。12 月 19 日不再开新题。",
  },
] as const;

const GRAMMAR = [
  { tag: "词性", title: "词性与词形", detail: "先判断空格要名词、动词、形容词还是副词。只看词尾，不翻译整句。" },
  { tag: "主谓一致", title: "主谓一致", detail: "先找真正的主语。介词短语里的名词经常是干扰。" },
  { tag: "时态", title: "时态", detail: "用 yesterday、already、by the time、next month 决定动词形式。" },
  { tag: "被动", title: "被动语态", detail: "动作的对象在句首时，用 be + 过去分词，再看时间决定 be 的形式。" },
  { tag: "分词", title: "分词", detail: "现在分词多表主动，过去分词多表被动。用来修饰名词或做状语。" },
  { tag: "不定式", title: "不定式和动名词", detail: "只记常见搭配：decide to、avoid doing。不展开整章语法。" },
  { tag: "介词", title: "介词搭配", detail: "depend on、comply with、responsible for。看空格旁边的词，不靠语感蒙。" },
  { tag: "连词", title: "连词", detail: "先看空格连接的是词还是完整句子，再选 and、but、although、because、once。" },
  { tag: "关系词", title: "关系词", detail: "人用 who，物用 which 或 that。从句缺所有格时用 whose。" },
  { tag: "代词", title: "代词", detail: "主格、宾格、所有格、反身代词。名词已经出现过时，空格常常是代词。" },
  { tag: "比较", title: "比较", detail: "有 than 用比较级，有范围用最高级。比较的两边结构要一样。" },
  { tag: "并列", title: "并列结构", detail: "both、either、not only 后面的形式要对称。" },
];

const SINGLE = [
  { title: "事实定位", detail: "先读题干里的人名、日期、金额，再回文章找原句。不要从头重读。" },
  { title: "同义替换", detail: "正确选项通常换一种说法。和原文长得一模一样的选项先怀疑。" },
  { title: "主旨", detail: "看标题、首段和每段第一句。主旨题不要被一个例子带走。" },
  { title: "目的", detail: "先问这篇文章为什么存在：通知、投诉、邀请还是广告。" },
  { title: "推断", detail: "可以比原文多走一步，但不能发明文章里没有的事实。" },
  { title: "排除", detail: "遇到 NOT / EXCEPT，先在文中划掉三项，再选剩下的。" },
  { title: "上下文词义", detail: "词汇题用这一句和上一句，不用你记住的第一个释义。" },
];

const MULTI = [
  { title: "先看文档类型", detail: "邮件、表格、广告、聊天。先花二十秒看每篇是什么，再做题。" },
  { title: "从 A 到 B", detail: "第一篇找事实，第二篇找更新、回复或冲突。" },
  { title: "跨文档", detail: "题干出现 both、what is indicated 时，两篇都要看到。" },
  { title: "用索引定位", detail: "日期、价格、人名用来定位。找到就停，不要把表格当散文读。" },
  { title: "谁写给谁", detail: "发件人、收件人和职位经常就是答案。" },
  { title: "先读图表标题", detail: "先读标题和单位，再对题。不要先陷进所有数字。" },
  { title: "三篇的顺序", detail: "先做只涉及一篇的题，最后做需要几篇一起看的题。" },
];

const P5 = ["词形", "动词", "介词", "连词", "代词", "比较"];

export function isExamDay(date: string, choice: ExamChoice | null): boolean {
  const targetDec20 = choice === null || choice === "dec20" || choice === "both";
  if (date === EXAM_DATE && targetDec20) return true;
  if (date === EARLY_EXAM && (choice === "nov22" || choice === "both")) return true;
  return false;
}

export function planForDate(
  date: string,
  input: { baselineDone: boolean; baselineSkipped: boolean; examChoice: ExamChoice | null },
): DayPlan {
  if (date < PROGRAM_START) {
    return buildPhase0(date, input.baselineDone, input.baselineSkipped);
  }
  return buildPlan(programDay(date), input.examChoice);
}

export function buildPlan(day: number, choice: ExamChoice | null): DayPlan {
  const date = dateForDay(day);
  if (isExamDay(date, choice)) return examPlan(day, date);
  if (isExamDay(addDays(date, 1), choice)) return evePlan(day, date);
  if (day <= 56) return core(day, date);
  if (day <= 81) return buffer(day, date);
  return afterPlan(day, date);
}

export function buildPhase0(date: string, baselineDone: boolean, skipped: boolean): DayPlan {
  if (!baselineDone && !skipped) {
    return {
      day: 0,
      date,
      week: 0,
      phase: "基线",
      focus: "先摸清起点",
      why: "先知道 Part 5、Part 6、Part 7 各自对多少。没有这三个数，后面只能按通用课表走。",
      light: false,
      kind: "baseline",
      tasks: [
        {
          id: "baseline-reading",
          category: "baseline",
          title: "做一套 Reading，或开课诊断",
          detail: "有完整阅读卷就做官方样题，75 分钟、100 题，不要查词。没有完整卷就做门户开课诊断，结果按正确率折算，不是官方分数。",
          minutes: 20,
          quantity: 17,
          unit: "questions",
          target: "记对正确数",
          resourceId: "offline-diagnostic",
          importance: 1,
        },
        {
          id: "baseline-log",
          category: "baseline",
          title: "把三个 Part 的正确数填进来",
          detail: "完整卷按 Part 5 共 30、Part 6 共 16、Part 7 共 54 填写。做了开课诊断的话，结果会自动记下。",
          minutes: 5,
          quantity: 1,
          unit: "none",
          resourceId: "ets-prepare",
          href: "/#baseline",
          importance: 1,
        },
      ],
    };
  }

  return {
    day: 0,
    date,
    week: 0,
    phase: "开课前",
    focus: "把每天的流程走顺",
    why: skipped
      ? "你先跳过了基线。10 月 12 日前只熟悉「做一点、记一点」。主计划会先按通用路线走，基线可以随时补。"
      : "56 天主计划从 10 月 12 日开始。这几天不提前消耗，只把词表、记录和报名确认走一遍。",
    light: true,
    kind: "light",
    tasks: [
      {
        ...vocabTask(0, 1, {
          title: "先过今天的 12 个词",
          detail: "打开门户词表。认识的翻过，不认识的点「留下」，会记入错题。",
          count: 12,
          minutes: 10,
        }),
        id: "p0-vocabulary",
      },
      {
        id: "p0-roadmap",
        category: "grammar",
        title: "看第 1 周要练什么",
        detail: "只看本周主线，不收藏别的资料。",
        minutes: 5,
        quantity: 1,
        unit: "none",
        resourceId: "cn-home",
        href: "/roadmap",
        importance: 1,
      },
      reviewTask(0, 2, 8, 3),
    ],
  };
}

function core(day: number, date: string): DayPlan {
  const week = Math.ceil(day / 7);
  const dow = (day - 1) % 7;
  const meta = WEEK_META[week];
  if (day === 56) return sprint(day, date, meta.title);
  if (dow === 6) return lightDay(day, week, meta.title);
  const tasks = weekdayTasks(day, week, dow);
  return {
    day,
    date,
    week,
    phase: meta.title,
    focus: focusFor(day, week, dow),
    why: whyFor(week),
    light: false,
    kind: "study",
    tasks,
  };
}

function focusFor(day: number, week: number, dow: number): string {
  const grammar = grammarAt(day);
  const skill = SINGLE[(day + dow) % SINGLE.length];
  const multi = MULTI[dow % MULTI.length];
  switch (week) {
    case 1:
      return `${grammar.tag}，加上今天的新词`;
    case 2:
      return `${grammar.tag}，然后做 Part 5`;
    case 3:
      return `Part 5 · ${P5[dow]}，目标 80%`;
    case 4:
      return "Part 6：先读整段再填空";
    case 5:
      return `单篇阅读 · ${skill.title}`;
    case 6:
      return `多篇阅读 · ${multi.title}`;
    case 7:
      return timedFocus(dow);
    default:
      return simFocus(dow);
  }
}

function whyFor(week: number): string {
  return WEEK_META[week]?.detail ?? "";
}

function weekdayTasks(day: number, week: number, dow: number): PlannedTask[] {
  if (week === 1) return week1(day, dow);
  if (week === 2) return week2(day, dow);
  if (week === 3) return week3(day, dow);
  if (week === 4) return week4(day, dow);
  if (week === 5) return week5(day, dow);
  if (week === 6) return week6(day, dow);
  if (week === 7) return week7(day, dow);
  return week8(day, dow);
}

function week1(day: number, dow: number): PlannedTask[] {
  const grammar = grammarAt(day);
  return [
    vocabTask(day, 1),
    grammarTask(day, grammar, 1, dow === 2 ? 12 : 15),
    part5Task(day, 8, 12, `Part 5 · ${P5[dow]}`, "先认出考点。只统计第一次做到的题。", 2, "offline-part5"),
    reviewTask(day, 3),
  ];
}

function week2(day: number, dow: number): PlannedTask[] {
  const grammar = grammarAt(day);
  return [
    grammarTask(day, grammar, 1, 12),
    part5Task(day, 8, 12, `Part 5 · ${grammar.tag}`, "目标 ≥ 75%。重复题不计入。", 1, "offline-part5"),
    vocabTask(day, 2),
    reviewTask(day, 3),
  ];
}

function week3(day: number, dow: number): PlannedTask[] {
  return [
    part5Task(day, 8, 12, `Part 5 · ${P5[dow]}`, "目标 ≥ 80%。只统计新题。", 1, "offline-part5"),
    grammarTask(day, grammarAt(day), 2, 8),
    vocabTask(day, 2),
    reviewTask(day, 1, 10, 6),
  ];
}

function week4(day: number, dow: number): PlannedTask[] {
  return [
    part6Task(day, 1, 12, 1),
    grammarTask(day, grammarAt(day), 2, 10),
    part5Task(day, [8, 8, 8, 6, 8, 8][dow] ?? 8, 8, "Part 5 维持", "不要掉回 70% 以下。只统计新题。", 3, "offline-part5"),
    vocabTask(day, 2),
    reviewTask(day, 2),
  ];
}

function week5(day: number, dow: number): PlannedTask[] {
  const skill = SINGLE[(day + dow) % SINGLE.length];
  return [
    part7Task(day, 1, "passages", `单篇 · ${skill.title}`, skill.detail, 12, 1, "offline-part7"),
    vocabTask(day, 2),
    part5Task(day, [6, 8, 6, 5, 8, 6][dow] ?? 6, 8, "Part 5 维持", "10 分钟内做完", 3, "offline-part5"),
    reviewTask(day, 2),
  ];
}

function week6(day: number, dow: number): PlannedTask[] {
  const skill = MULTI[dow % MULTI.length];
  const tasks: PlannedTask[] = [
    part7Task(day, 1, "sets", `双篇 · ${skill.title}`, skill.detail, 12, 1, "offline-part7-multi"),
    reviewTask(day, 2, 8, 4),
    vocabTask(day, 3),
  ];
  if (dow % 2 === 0) {
    tasks.splice(1, 0, part6Task(day, 1, 8, 2));
  }
  return tasks;
}

function week7(day: number, dow: number): PlannedTask[] {
  const timed = timedTasks(day, dow);
  return [...timed, vocabTask(day, 3), reviewTask(day, 2, 8, 4)];
}

function timedFocus(dow: number): string {
  return [
    "Part 5 限时 12 分钟",
    "Part 6 限时 10 分钟",
    "单篇阅读限时",
    "双篇阅读限时",
    "Part 5 + Part 6 一起计时",
    "Part 7 能做多少记多少",
  ][dow] ?? "限时阅读";
}

function timedTasks(day: number, dow: number): PlannedTask[] {
  if (dow === 0) {
    return [part5Task(day, 8, 12, "Part 5 一组限时", "门户今天 8 题，12 分钟封顶。完整 30 题用官方样题。", 1, "offline-part5")];
  }
  if (dow === 1) {
    return [part6Task(day, 1, 10, 1, "Part 6 一篇限时", "先读完整段，10 分钟封顶。完整 4 篇用官方样题。")];
  }
  if (dow === 2) {
    return [part7Task(day, 1, "passages", "单篇限时", "今天这一篇，12 分钟封顶。先做题干里的关键词。", 12, 1, "offline-part7")];
  }
  if (dow === 3) {
    return [part7Task(day, 1, "sets", "双篇限时", "今天这一套，12 分钟。跨文档题最后做。", 12, 1, "offline-part7-multi")];
  }
  if (dow === 4) {
    return [
      part5Task(day, 8, 12, "Part 5 限时", "8 题，12 分钟封顶。", 1, "offline-part5"),
      part6Task(day, 1, 10, 1, "Part 6 限时", "紧接着做这一篇，10 分钟封顶。"),
    ];
  }
  return [part7Task(day, 1, "passages", "Part 7 限时", "今天这一篇，12 分钟。做完或时间到就停。", 12, 1, "offline-part7")];
}

function simFocus(dow: number): string {
  return ["半套 Reading", "只补最弱的一类", "Part 7 长块", "错题重修", "第二套的前半", "只留最弱的 Part"][dow] ?? "模拟";
}

function week8(day: number, dow: number): PlannedTask[] {
  if (dow === 0) {
    return [
      part5Task(day, 8, 12, "Part 5 限时", "今天 8 题，12 分钟。完整 30 题用官方样题。", 1, "offline-part5"),
      part6Task(day, 1, 10, 1),
      part7Task(day, 1, "passages", "接着做一篇单篇", "做完就记正确数。", 12, 1, "offline-part7"),
    ];
  }
  if (dow === 1 || dow === 3) {
    return [
      repairTask(day, 1),
      vocabTask(day, 2),
      reviewTask(day, 1, 10, 6),
    ];
  }
  if (dow === 2) {
    return [
      part7Task(day, 1, "sets", "双篇长块", "今天这一套，12 分钟，到点就停。完整长块用官方样题。", 12, 1, "offline-part7-multi"),
      reviewTask(day, 2),
    ];
  }
  if (dow === 4) {
    return [
      part5Task(day, 8, 12, "Part 5 再限时一组", "8 题，12 分钟。", 1, "offline-part5"),
      part6Task(day, 1, 10, 1, "Part 6 再限时一篇", "10 分钟。"),
      part7Task(day, 1, "passages", "Part 7 再限时一篇", "12 分钟，到点就停。", 12, 1, "offline-part7"),
    ];
  }
  return [repairTask(day, 1), reviewTask(day, 1, 12, 8)];
}

function sprint(day: number, date: string, phase: string): DayPlan {
  return {
    day,
    date,
    week: 8,
    phase,
    focus: "第一次完整冲刺",
    why: "今天把 Reading 按 75 分钟走一遍。做不完就记下停在哪一题，不要为了做完而无限加时。",
    light: false,
    kind: "study",
    tasks: [
      {
        id: `d${day}-mock`,
        category: "mock",
        title: "Reading 一整套",
        detail: "Part 5 约 12 分钟，Part 6 约 10 分钟，其余给 Part 7。完整 100 题用 ETS 官方样题。门户短套只用来热身。",
        minutes: 75,
        quantity: 100,
        unit: "questions",
        target: "记下正确数和停住的位置",
        resourceId: "ets-prepare",
        importance: 1,
      },
      reviewTask(day, 2, 10, 5),
    ],
  };
}

function lightDay(day: number, week: number, phase: string): DayPlan {
  const tasks: PlannedTask[] = [vocabTask(day, 2), reviewTask(day, 1, 12, 6)];
  if (week <= 3) tasks.splice(1, 0, part5Task(day, 8, 10, "重做本周错的句子", "不对新题", 1, "offline-part5"));
  else if (week === 4) tasks.splice(1, 0, part6Task(day, 1, 8, 1, "重读一篇 Part 6", "只看上次犹豫的空。"));
  else if (week === 5) {
    tasks.splice(1, 0, part7Task(day, 1, "passages", "重读一篇单篇", "只核对上次定位错的题。", 10, 1, "offline-part7"));
  } else {
    tasks.splice(1, 0, part7Task(day, 1, "sets", "重做一套双篇", "只看跨文档那几题。", 12, 1, "offline-part7-multi"));
  }
  return {
    day,
    date: dateForDay(day),
    week,
    phase,
    focus: "今天少做，只收不熟的",
    why: "恢复日不加新课。错题和词收完，连续就还在。缺的天数不用堆到明天。",
    light: true,
    kind: "light",
    tasks,
  };
}

function buffer(day: number, date: string): DayPlan {
  const cycle = (day - 57) % 4;
  const book = "ets-prepare";
  const phase = "缓冲";
  if (cycle === 0) {
    return {
      day,
      date,
      week: 9,
      phase,
      focus: "半套 Reading",
      why: "缓冲期不再学新语法。做半套，然后只看错得最多的那一类。",
      light: false,
      kind: "study",
      tasks: [
        {
          id: `d${day}-mock`,
          category: "mock",
          title: "官方样题 · Reading 前半",
          detail: "在 ETS 样题里做 Part 5、Part 6，再加两篇 Part 7。门户短套用来热身。",
          minutes: 40,
          quantity: 50,
          unit: "questions",
          target: "记下正确数",
          resourceId: book,
          importance: 1,
        },
        reviewTask(day, 2),
      ],
    };
  }
  if (cycle === 1) {
    return {
      day,
      date,
      week: 9,
      phase,
      focus: "只补一类",
      why: "今天不打开新套题。错题本里最多的原因，就是今天的全部。",
      light: false,
      kind: "study",
      tasks: [repairTask(day, 1), vocabTask(day, 2), reviewTask(day, 1, 10, 5)],
    };
  }
  if (cycle === 2) {
    return {
      day,
      date,
      week: 9,
      phase,
      focus: "词和错题维持",
      why: "保持手感即可。不要临时加一份新资料。",
      light: true,
      kind: "light",
      tasks: [vocabTask(day, 1), reviewTask(day, 1, 10, 5)],
    };
  }
  return {
    day,
    date,
    week: 9,
    phase,
    focus: "今天可以很短",
    why: "留白也是计划的一部分。只看到期的错题。",
    light: true,
    kind: "light",
    tasks: [reviewTask(day, 1, 10, 4)],
  };
}

function examPlan(day: number, date: string): DayPlan {
  return {
    day,
    date,
    week: date <= PROGRAM_END ? 8 : 9,
    phase: "考试日",
    focus: "今天去考试",
    why: "不再做题。证件、水和提前到场。阅读部分求稳，不要在一道题上耗掉后面的文章。",
    light: true,
    kind: "exam",
    tasks: [
      {
        id: `d${day}-exam`,
        category: "baseline",
        title: "核对场次，然后去考",
        detail: "以准考证和官方日程为准。考完如果还记得，再在进度里记你卡在哪一部分。",
        minutes: 5,
        quantity: 1,
        unit: "none",
        resourceId: "cn-schedule",
        importance: 1,
      },
    ],
  };
}

function evePlan(day: number, date: string): DayPlan {
  return {
    day,
    date,
    week: date < PROGRAM_START ? 0 : date <= PROGRAM_END ? Math.ceil(day / 7) : 9,
    phase: "考前",
    focus: "收一收，早点睡",
    why: "今晚不要新开一套。新题不会在一夜之间变成分数。",
    light: true,
    kind: "eve",
    tasks: [
      reviewTask(day, 1, 10, 4),
      vocabTask(day, 2),
    ],
  };
}

function afterPlan(day: number, date: string): DayPlan {
  return {
    day,
    date,
    week: 9,
    phase: "结束",
    focus: "这版日历已经结束",
    why: "如果还要再考，到设置里改目标日期。已经考完的话，把记录导出留档。",
    light: true,
    kind: "light",
    tasks: [reviewTask(day, 1, 10, 4)],
  };
}

function grammarAt(day: number) {
  const index = day <= 14 ? day - Math.floor(day / 7) - 1 : (day - 1) % GRAMMAR.length;
  return GRAMMAR[(index + GRAMMAR.length) % GRAMMAR.length];
}

function earlyCount(day: number): number {
  const dow = (day - 1) % 7;
  return [12, 12, 12, 12, 12, 10][dow] ?? 12;
}

function laterCount(day: number): number {
  const dow = (day - 1) % 7;
  return [8, 8, 8, 8, 8, 6][dow] ?? 8;
}

function vocabSpec(day: number): { title: string; detail: string; count: number; minutes: number } {
  if (day === 7 || day === 14 || (day > 14 && day % 7 === 0)) {
    const label = day === 7 ? "第 1 周的新词" : day === 14 ? "第 2 周的新词" : "这周不熟的词";
    return {
      title: `复习${label}`,
      detail: "认识的跳过。不认识的点「留下」，会记入错题。",
      count: 12,
      minutes: 12,
    };
  }
  if (day < 15) {
    const count = earlyCount(day);
    return {
      title: `今天的 ${count} 个词`,
      detail: "门户词库按天换一组。不认识的会记入错题。重复出现的只复习，不改变下周安排。",
      count,
      minutes: count >= 28 ? 15 : 12,
    };
  }
  const count = laterCount(day);
  return {
    title: `今天的 ${count} 个词`,
    detail: "新词只过一遍，再看几个上次不熟的旧词。",
    count,
    minutes: 10,
  };
}

function vocabTask(
  day: number,
  importance: 1 | 2 | 3,
  override?: { title: string; detail: string; count: number; minutes: number },
): PlannedTask {
  const spec = override ?? vocabSpec(day);
  return {
    id: `d${day}-vocabulary`,
    category: "vocabulary",
    title: spec.title,
    detail: spec.detail,
    minutes: spec.minutes,
    quantity: spec.count,
    unit: "words",
    target: "不认识的留下来",
    resourceId: "offline-vocab",
    importance,
  };
}

function grammarTask(
  day: number,
  grammar: { title: string; detail: string },
  importance: 1 | 2 | 3,
  minutes: number,
): PlannedTask {
  return {
    id: `d${day}-grammar`,
    category: "grammar",
    title: grammar.title,
    detail: grammar.detail,
    minutes,
    quantity: 5,
    unit: "questions",
    target: "能说出考点名字",
    resourceId: "offline-part5",
    href: "/practice/part5?salt=1",
    importance,
  };
}

function part5Task(
  day: number,
  quantity: number,
  minutes: number,
  title: string,
  target: string,
  importance: 1 | 2 | 3,
  resourceId: string,
): PlannedTask {
  return {
    id: `d${day}-part5`,
    category: "part5",
    title,
    detail: "门户里做。第一次见到的题才计入正确率。做完回到今天的任务勾掉。",
    minutes,
    quantity,
    unit: "questions",
    target,
    resourceId,
    importance,
  };
}

function part6Task(
  day: number,
  passages: number,
  minutes: number,
  importance: 1 | 2 | 3,
  title = `Part 6 · ${passages} 篇`,
  detail = "先通读整段，再填空。句与句之间的连词，不要当孤立的 Part 5。",
): PlannedTask {
  return {
    id: `d${day}-part6`,
    category: "part6",
    title,
    detail,
    minutes,
    quantity: passages * 4,
    unit: "questions",
    target: "先读再填",
    resourceId: "offline-part6",
    importance,
  };
}

function part7Task(
  day: number,
  quantity: number,
  unit: "passages" | "sets",
  title: string,
  detail: string,
  minutes: number,
  importance: 1 | 2 | 3,
  resourceId: string,
): PlannedTask {
  return {
    id: `d${day}-part7`,
    category: "part7",
    title,
    detail,
    minutes,
    quantity,
    unit,
    target: "记下用时",
    resourceId,
    importance,
  };
}

function repairTask(day: number, importance: 1 | 2 | 3): PlannedTask {
  return {
    id: `d${day}-repair`,
    category: "review",
    title: "按最多的错因重做 15 题",
    detail: "先看错题本里哪一类最多，再只做那一类。不要平均分配到所有 Part。",
    minutes: 25,
    quantity: 15,
    unit: "questions",
    target: "只补一类",
    resourceId: "offline-part5",
    importance,
  };
}

function reviewTask(day: number, importance: 1 | 2 | 3, minutes = 8, quantity = 4): PlannedTask {
  return {
    id: `d${day}-review`,
    category: "review",
    title: `复习 ${quantity} 条错题`,
    detail: "每条只重做一遍，能说出错因再算复习过。没有错题就跳过。",
    minutes,
    quantity,
    unit: "mistakes",
    resourceId: "internal-mistakes",
    href: "/mistakes",
    importance,
  };
}
