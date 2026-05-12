import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const services = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/services" }),
  schema: z.object({
    order: z.number().int(),
    slug: z.string(),
    number: z.string().regex(/^\d{2}$/),
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    methods: z.array(z.string()),
    relatedCaseStudies: z.array(z.string()).default([]),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/case-studies" }),
  schema: z.object({
    slug: z.string(),
    client: z.string(),
    title: z.string(),
    year: z.number().int(),
    domain: z.string(),
    summary: z.string(),
    challenge: z.string(),
    approach: z.string(),
    outcome: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    capabilities: z.array(z.string()),
    badges: z.array(z.string()).default([]),
  }),
});

const jobs = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/jobs" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    location: z.string(),
    level: z.enum(["entry", "mid", "senior", "principal"]),
    type: z.enum(["full-time", "part-time", "contract"]),
    department: z.string(),
    posted: z.coerce.date(),
    open: z.boolean().default(true),
    summary: z.string(),
    responsibilities: z.array(z.string()),
    qualifications: z.array(z.string()),
    bonus: z.array(z.string()).default([]),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: "**/*.yml", base: "./src/content/team" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    role: z.string(),
    leadership: z.boolean().default(false),
    order: z.number().int().default(100),
    bio: z.string(),
    portrait: z.string().optional(),
    email: z.string().email().optional(),
    linkedin: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, caseStudies, jobs, team, blog };
