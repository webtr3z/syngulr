import { nanoid } from "nanoid";

const NODE_PREFIX = "node";
const EDGE_PREFIX = "edge";

export function createNodeId() {
  return `${NODE_PREFIX}-${nanoid(8)}`;
}

export function createEdgeId() {
  return `${EDGE_PREFIX}-${nanoid(10)}`;
}
