import type { FlowDocument } from "@/lib/schema";
import type { LayoutDirection } from "@/lib/layout";

function sanitizeId(id: string) {
  return id.replace(/[^A-Za-z0-9_]/g, "_");
}

function escapeLabel(text: string) {
  return text.replace(/"/g, '\\"');
}

export function toMermaid(
  document: FlowDocument,
  direction: LayoutDirection = "LR",
): string {
  const header = direction === "TB" ? "graph TB" : "graph LR";

  const nodeLines = document.nodes.map((node) => {
    const nodeId = sanitizeId(node.id);
    const title = escapeLabel(node.data.title);
    const description = node.data.description
      ? `<br/>${escapeLabel(node.data.description)}`
      : "";
    return `  ${nodeId}["${title}${description}"]`;
  });

  const edgeLines = document.edges.map((edge) => {
    const sourceId = sanitizeId(edge.source);
    const targetId = sanitizeId(edge.target);
    const label =
      typeof edge.label === "string" && edge.label.length > 0
        ? ` |${escapeLabel(edge.label)}|`
        : "";
    return `  ${sourceId} -->${label} ${targetId}`;
  });

  return [header, ...nodeLines, ...edgeLines].join("\n");
}
