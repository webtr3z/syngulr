import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";

import type { FlowEdge, FlowNode } from "@/lib/schema";

const elk = new ELK();

export type LayoutDirection = "LR" | "TB";

const DEFAULT_NODE_WIDTH = 260;
const DEFAULT_NODE_HEIGHT = 160;

const LAYOUT_OPTIONS: Record<LayoutDirection, Record<string, string>> = {
  LR: {
    "elk.direction": "RIGHT",
  },
  TB: {
    "elk.direction": "DOWN",
  },
};

export async function applyElkLayout(
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction: LayoutDirection = "LR",
): Promise<FlowNode[]> {
  if (nodes.length === 0) {
    return nodes;
  }

  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      ...LAYOUT_OPTIONS[direction],
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.spacing.nodeNode": "48",
      "elk.algorithm": "layered",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(graph);
  const childMap = new Map(
    (layout.children ?? []).map((child) => [child.id, child]),
  );

  return nodes.map((node) => {
    const layoutNode = childMap.get(node.id);
    if (!layoutNode) {
      return node;
    }

    return {
      ...node,
      position: {
        x: layoutNode.x ?? node.position.x,
        y: layoutNode.y ?? node.position.y,
      },
    };
  });
}
