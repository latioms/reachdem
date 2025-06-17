import * as z from "zod";

export const contactSchema = z.object({
  first_name: z.string()
    .max(50, "Le prénom doit contenir au plus 50 caractères")
    .optional(),
  last_name: z.string()
    .max(50, "Le nom doit contenir au plus 50 caractères")
    .optional(),
  email: z.string()
    .min(1, "L'email est requis")
    .email("Veuillez entrer une adresse email valide"),
  phone: z.string()
    .regex(/^[\+]?[\d\s\-\(\)]+$/, "Veuillez entrer un numéro de téléphone valide")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(200, "L'adresse doit contenir au plus 200 caractères")
    .optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
