export interface ResearchEntry {
  /** Stable URL fragment and future route slug. */
  slug: string;
  title: string;
  summary: string;
  /** Research date, ISO `YYYY-MM-DD`. */
  date: string;
  /** Optional last revision, ISO `YYYY-MM-DD`. */
  updated?: string;
  status: "进行中" | "已完成" | "归档";
  tags: string[];
  href: string;
}

export const research: ResearchEntry[] = [
  {
    slug: "sta",
    title: "时空代数动画：旋量与 Wigner 旋转",
    summary:
      "用 Wolfram 计算 Cl(1,3) 的 boost 转子、reversion 与极分解，manimgl 渲染两条 1080p 动画：Lorentz 收缩与 Wigner 旋转。",
    date: "2026-10-20",
    status: "已完成",
    tags: ["时空代数", "Wolfram", "manim"],
    href: "/research/sta/",
  },
  {
    slug: "ga-finetuning",
    title: "几何代数微调：模式迁移的边界",
    summary:
      "Qwen3-4B-Base 在 6GB 笔记本显卡上的 QLoRA 实验：记忆 47.3%、泛化 33.6%、迁移 50.0%。同构任务可迁移，新运算失效。",
    date: "2026-09-26",
    updated: "2026-10-20",
    status: "归档",
    tags: ["LLM 微调", "几何代数", "QLoRA"],
    href: "/research/ga/",
  },
].sort((a, b) => b.date.localeCompare(a.date));
