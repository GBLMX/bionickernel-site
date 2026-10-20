import { essays } from "../data/essays";

const ORIGIN = "https://bionickernel.com";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const items = essays
    .map((essay) => {
      const url = `${ORIGIN}/essays/${essay.slug}.html`;
      return `    <item>
      <title>${escapeXml(essay.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${essay.date}T00:00:00+08:00`).toUTCString()}</pubDate>
      <description>${escapeXml(essay.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>bionickernel.com</title>
    <link>${ORIGIN}/essays/</link>
    <description>隔壁老木箱的观点与笔记。</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
