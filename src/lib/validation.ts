import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, _ and -"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const ozSchema = z.coerce.number().int().min(1).max(999);

export const goalSchema = z.coerce.number().int().min(1).max(999);

export const presetSchema = z.object({
  label: z.string().trim().min(1).max(32),
  oz: ozSchema,
});

export const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine((value) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Invalid timezone");

export const backgroundColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Background color must be a hex value like #F7F0E4");

export const entryIdSchema = z.string().cuid();

export const presetIdSchema = z.string().cuid();

export const userIdSchema = z.string().cuid();
