import { z } from "zod";
import { TONES, PLATFORMS, MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/constants";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const generateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(MIN_INPUT_CHARS, `Add at least ${MIN_INPUT_CHARS} characters of input`)
    .max(MAX_INPUT_CHARS, `Input must be under ${MAX_INPUT_CHARS} characters`),
  tone: z.enum(TONES, { errorMap: () => ({ message: "Select a valid tone" }) }),
  platforms: z
    .array(z.enum(PLATFORMS))
    .min(1, "Select at least one platform")
    .max(PLATFORMS.length),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
