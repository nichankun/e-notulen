import { z } from "zod";

const evidenceSchema = z.object({
  timestamp: z.string().trim().max(20).nullable(),
  quote: z.string().trim().min(1).max(500),
});

const confidenceSchema = z.enum(["high", "medium", "low"]);

const discussionSchema = z.object({
  point: z.string().trim().min(1).max(2_000),
  evidence: z.array(evidenceSchema).max(5),
  confidence: confidenceSchema,
  verificationRequired: z.boolean(),
});

const decisionSchema = z.object({
  decision: z.string().trim().min(1).max(2_000),
  status: z.enum(["confirmed", "proposed", "unclear"]),
  evidence: z.array(evidenceSchema).max(5),
  confidence: confidenceSchema,
  verificationRequired: z.boolean(),
});

const actionItemSchema = z.object({
  task: z.string().trim().min(1).max(2_000),
  pic: z.string().trim().max(300).nullable(),
  deadline: z.string().trim().max(200).nullable(),
  status: z.enum(["not_started", "in_progress", "completed", "unclear"]),
  evidence: z.array(evidenceSchema).max(5),
  confidence: confidenceSchema,
  verificationRequired: z.boolean(),
});

export const meetingSummarySchema = z.object({
  version: z.literal(1),
  overview: z.string().trim().max(4_000),
  discussion: z.array(discussionSchema).max(40),
  decisions: z.array(decisionSchema).max(40),
  actionItems: z.array(actionItemSchema).max(40),
  verificationItems: z.array(z.string().trim().min(1).max(500)).max(40),
});

export type ValidatedMeetingSummary = z.infer<typeof meetingSummarySchema>;
