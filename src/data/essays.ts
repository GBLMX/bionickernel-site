import historyAndMath from "../content/essays/history-and-math.html?raw";

export interface Essay {
  slug: string;
  title: string;
  description: string;
  date: string;
  body: string;
}

export const essays: Essay[] = [
  {
    slug: "history-and-math",
    title: "历史与数学",
    description: "学一个领域绕不开两样东西：它的发展史与它依赖的数学。",
    date: "2026-10-20",
    body: historyAndMath,
  },
].sort((a, b) => b.date.localeCompare(a.date));
