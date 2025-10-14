import type { FlowDocument, FlowNodeData } from "@/lib/schema";
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

const DEFAULT_VARIANT: FlowNodeData["variant"] = "standard";

function normalizeLabel(raw: string | undefined) {
  if (!raw) {
    return { title: "", description: undefined as string | undefined };
  }
  const trimmed = raw.trim().replace(/^\[|\]$/g, "").replace(/^"+|"+$/g, "");
  const parts = trimmed.split(/<br\s*\/?>/i);
  const title = parts[0]?.trim() ?? "";
  const description =
    parts.length > 1
      ? parts
          .slice(1)
          .map((part) => part.trim())
          .filter(Boolean)
          .join("\n")
      : undefined;
  return { title, description };
}

export function mermaidToDocument(source: string): FlowDocument {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("%%"));

  const nodeMap = new Map<
    string,
    { title: string; description?: string; variant: FlowNodeData["variant"] }
  >();
  const edges: FlowDocument["edges"] = [];

  for (const line of lines) {
    if (/^graph\s+/i.test(line)) {
      continue;
    }

    const nodeMatch = line.match(/^([\w-]+)\s*\[([^\]]+)\]$/);
    if (nodeMatch) {
      const nodeId = nodeMatch[1];
      const { title, description } = normalizeLabel(`[${nodeMatch[2]}]`);
      nodeMap.set(nodeId, {
        title: title || nodeId,
        description,
        variant: DEFAULT_VARIANT,
      });
      continue;
    }

    const edgeMatch = line.match(
      /^([\w-]+)(\s*\[[^\]]+\])?\s*-->\s*(\|(.+?)\|)?\s*([\w-]+)(\s*\[[^\]]+\])?/,
    );

    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const targetId = edgeMatch[5];
      const label = edgeMatch[4]?.trim();

      if (!nodeMap.has(sourceId)) {
        const { title, description } = normalizeLabel(edgeMatch[2]);
        nodeMap.set(sourceId, {
          title: title || sourceId,
          description,
          variant: DEFAULT_VARIANT,
        });
      }

      if (!nodeMap.has(targetId)) {
        const { title, description } = normalizeLabel(edgeMatch[6]);
        nodeMap.set(targetId, {
          title: title || targetId,
          description,
          variant: DEFAULT_VARIANT,
        });
      }

      edges.push({
        id: `edge-${edges.length + 1}`,
        source: sourceId,
        target: targetId,
        sourceHandle: undefined,
        targetHandle: undefined,
        label: label && label.length > 0 ? label : undefined,
        type: "default",
      });
    }
  }

  if (nodeMap.size === 0) {
    throw new Error("No se encontraron nodos válidos en el diagrama Mermaid.");
  }

  const nodes: FlowDocument["nodes"] = [];
  let index = 0;
  for (const [nodeId, data] of nodeMap.entries()) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    nodes.push({
      id: nodeId,
      type: "flowNode",
      position: {
        x: column * 240,
        y: row * 180,
      },
      data: {
        title: data.title || nodeId,
        description: data.description,
        variant: data.variant,
      },
    });
    index += 1;
  }

  return {
    nodes,
    edges,
  };
}
