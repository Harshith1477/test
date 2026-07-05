import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(200),
  phone: z.string().max(20).optional(),
  service: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  message: z.string().min(1, "Message is required").max(2000),
  website_url: z.string().optional(), // Honeypot
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
