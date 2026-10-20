const IMAGE = /\.(png|jpe?g|gif|svg|webp|avif)$/i;
const WIKI = /!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Convert the Obsidian subset used by research notes into standard mdast. */
export default {
  name: "obsidian-links",
  text(node, ctx) {
    if (!node.value.includes("[[")) return;
    ctx.replaceNode(node, expand(node.value));
  },
};

function expand(value) {
  const out = [];
  const re = new RegExp(WIKI.source, "g");
  let last = 0;
  let match;
  while ((match = re.exec(value))) {
    if (match.index > last) out.push({ type: "text", value: value.slice(last, match.index) });
    const target = match[1].trim();
    const label = (match[2] || match[1]).trim();
    if (match[0].startsWith("!")) {
      if (IMAGE.test(target)) {
        out.push({ type: "image", url: `./${target.split("/").pop()}`, alt: label });
      } else {
        out.push({ type: "text", value: label });
      }
    } else if (/^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(target)) {
      out.push({
        type: "link",
        url: `/research/notes/${target.replace(/\.md$/, "")}.html`,
        children: [{ type: "text", value: label }],
      });
    } else {
      out.push({ type: "text", value: label });
    }
    last = match.index + match[0].length;
  }
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
  return out;
}
