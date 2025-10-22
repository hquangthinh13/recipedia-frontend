import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().trim().min(1, "Password is required"),
});
