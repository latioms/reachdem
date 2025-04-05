import * as z from "zod";

export const projectSchema = z.object({
  sender_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(10, "Le nom doit contenir au plus 10 caractères"),   
});

export type ProjectInput = z.infer<typeof projectSchema>;
