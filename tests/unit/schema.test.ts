import { describe, expect, it } from "vitest";

import { documentSchema } from "@/lib/schema";

describe("documentSchema", () => {
  it("parses a valid document", () => {
    const document = {
      nodes: [
        {
          id: "node-1",
          type: "flowNode",
          position: { x: 0, y: 0 },
          data: { title: "Start", description: "First step" },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
        },
      ],
    };

    const parsed = documentSchema.parse(document);
    expect(parsed).toEqual(document);
  });

  it("throws for invalid nodes", () => {
    const invalid = {
      nodes: [
        {
          id: "node-1",
          type: "flowNode",
          position: { x: 0, y: 0 },
          data: { title: "" },
        },
      ],
      edges: [],
    };

    expect(() => documentSchema.parse(invalid)).toThrow();
  });
});
