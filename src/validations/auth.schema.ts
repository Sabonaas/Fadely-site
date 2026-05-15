import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, 'Nome obrigatório').max(120),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export type SignInDto = z.infer<typeof signInSchema>;
export type SignUpDto = z.infer<typeof signUpSchema>;
