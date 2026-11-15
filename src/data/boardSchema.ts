import type { Node } from "@xyflow/react";
import { z } from "zod";

const card = z.object({
  id: z.string().min(1),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
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
    width: z.number().positive().default(354),
    height: z.number().positive().default(372),
    data: cardData.extend({ src: z.string(), alt: z.string() }),
  }),
  card.extend({
    type: z.literal("model"),
    width: z.number().positive().default(354),
    height: z.number().positive().default(278),
    data: cardData.extend({
      src: z.string().min(1).default("/gear.glb"),
      poster: z.string().optional(),
    }),
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
export type BoardSnapshotInput = z.input<typeof boardSchema>;

type SavedNode = z.infer<typeof nodeSchema>;
export type BoardNode = {
  [Kind in SavedNode["type"]]: Node<Extract<SavedNode, { type: Kind }>["data"], Kind>;
}[SavedNode["type"]];
export type NoteNode = Extract<BoardNode, { type: "note" }>;
export type ImageNode = Extract<BoardNode, { type: "image" }>;
export type ModelNode = Extract<BoardNode, { type: "model" }>;
