// Rough read time: 250 CJK characters or 200 Latin words per minute.
export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latin = (text.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 250 + latin / 200));
}
