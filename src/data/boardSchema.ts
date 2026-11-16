import type { Node } from "@xyflow/react";
import { z } from "zod";

const gearModelSrc = "/gear-assembly.glb";
const gearPosterSrc = "/gear-assembly-preview.png";
const bracketModelSrc = "/mounting-bracket.glb";
const bracketPosterSrc = "/mounting-bracket-preview.png";

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
    data: cardData
      .extend({
        src: z.string().min(1).default(gearModelSrc),
        poster: z.string().optional(),
      })
      .transform((data) => {
        if (data.src === bracketModelSrc && !data.poster) {
          return { ...data, poster: bracketPosterSrc };
        }

        // Upgrade saved boards that point to the former local-only gear.
        if (data.src !== "/gear.glb" && data.src !== gearModelSrc) return data;

        return {
          ...data,
          src: gearModelSrc,
          poster: data.poster && data.poster !== "/gear-preview.jpg"
            ? data.poster
            : gearPosterSrc,
        };
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
