import { Node, Edge } from "@xyflow/react";
import { z } from "zod";

export const nodeDataSchema = z.object({
  title: z.string().min(1, "Se requiere un título"),
  description: z.string().optional(),
  variant: z
    .enum(["standard", "condition"])
    .catch("standard")
    .default("standard"),
});

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const nodeSchema = z.object({
  id: z.string(),
  type: z.literal("flowNode"),
  position: positionSchema,
  data: nodeDataSchema,
  width: z.number().optional(),
  height: z.number().optional(),
});

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  type: z.string().optional(),
});

export const documentSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export type FlowNodeVariant = z.infer<typeof nodeDataSchema>["variant"];
export type FlowNodeData = z.infer<typeof nodeDataSchema>;
export type FlowNodeSchema = z.infer<typeof nodeSchema>;
export type FlowEdgeSchema = z.infer<typeof edgeSchema>;
export type FlowDocument = z.infer<typeof documentSchema>;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;
