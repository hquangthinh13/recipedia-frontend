import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim(),
});
