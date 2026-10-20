import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
);

const research = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "!**/.obsidian/**", "!**/.trash/**"],
    base: "./src/content/research",
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: isoDate,
    updated: isoDate.optional(),
    status: z.enum(["进行中", "已完成", "归档"]).default("归档"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { research };
