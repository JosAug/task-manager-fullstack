import { z } from "zod";

const emptyToNull = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
};

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: "id deve ser um inteiro positivo" }),
});

export const registerBodySchema = z.object({
  email: z
    .string({ required_error: "email é obrigatório" })
    .trim()
    .min(1, "email é obrigatório")
    .email("e-mail inválido")
    .max(255, "e-mail muito longo")
    .transform((s) => s.toLowerCase()),
  password: z
    .string({ required_error: "password é obrigatório" })
    .min(6, "senha deve ter pelo menos 6 caracteres")
    .max(128, "senha muito longa"),
  name: z
    .string({ required_error: "name é obrigatório" })
    .trim()
    .min(1, "nome é obrigatório")
    .max(100, "nome muito longo"),
});

export const deleteAccountBodySchema = z.object({
  password: z
    .string({ required_error: "password é obrigatório" })
    .min(1, "informe sua senha para confirmar")
    .max(128),
});

export const loginBodySchema = z.object({
  email: z
    .string({ required_error: "email é obrigatório" })
    .trim()
    .min(1, "email é obrigatório")
    .email("e-mail inválido")
    .max(255)
    .transform((s) => s.toLowerCase()),
  password: z
    .string({ required_error: "password é obrigatório" })
    .min(1, "password é obrigatório")
    .max(128),
});

export const taskCreateBodySchema = z.object({
  title: z
    .string({ required_error: "title é obrigatório" })
    .trim()
    .min(1, "title não pode ser vazio")
    .max(200, "title muito longo"),
  description: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null) return null;
      const s = String(v).trim();
      return s.length === 0 ? null : s;
    })
    .refine((v) => v === null || v.length <= 2000, {
      message: "descrição muito longa",
    }),
});

export const taskPutBodySchema = z.object({
  title: z
    .string({ required_error: "title é obrigatório" })
    .trim()
    .min(1, "title não pode ser vazio")
    .max(200, "title muito longo"),
  description: z.preprocess(emptyToNull, z.union([z.null(), z.string().max(2000)])),
  completed: z.boolean({ required_error: "completed é obrigatório (true/false)" }),
});

export const taskPatchBodySchema = z
  .object({
    title: z.string().trim().min(1, "title não pode ser vazio").max(200).optional(),
    description: z.preprocess(
      (v) => (v === undefined ? undefined : emptyToNull(v)),
      z.union([z.null(), z.string().max(2000)]).optional()
    ),
    completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });
