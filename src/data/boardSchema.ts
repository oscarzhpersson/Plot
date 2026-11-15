import type { Node } from "@xyflow/react";
import { z } from "zod";

const card = z.object({
  id: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
});

const cardData = z.object({
  label: z.string(),
  subtitle: z.string().default(""),
});

const nodeSchema = z.discriminatedUnion("type", [
  card.extend({
    type: z.literal("note"),
    data: cardData.extend({ text: z.string() }),
  }),
  card.extend({
    type: z.literal("image"),
    data: cardData.extend({ src: z.string(), alt: z.string() }),
  }),
]);

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullish(),
  targetHandle: z.string().nullish(),
});

export const boardSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export type BoardSnapshot = z.infer<typeof boardSchema>;
export type BoardNode = z.infer<typeof nodeSchema> & Node;
export type NoteNode = Extract<BoardNode, { type: "note" }>;
export type ImageNode = Extract<BoardNode, { type: "image" }>;
