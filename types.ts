import { TaskType } from '@groceries/shared_types';
import z from 'zod';

export const LoginResponseSchema = z.object({
  email: z.string().email(),
  id: z.string().uuid(),
  token: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3, 'Password must be atleast 3 characters long'),
});
export type LoginType = z.infer<typeof LoginSchema>;

export type EditTaskProps = Pick<TaskType, 'id' | 'task'>;

export const RegisterSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(3, 'Password must be atleast 3 characters long'),
    confirm: z.string(),
  })
  .refine(({ password, confirm }) => password === confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  })
  .transform((data) => ({
    ...data,
    name: data.name.toLocaleLowerCase(),
    email: data.email.toLocaleLowerCase(),
  }));

export type RegisterType = z.infer<typeof RegisterSchema>;
export const SearchUserSchema = z.object({
  name: z.string(),
  id: z.string().uuid(),
});
export type SearchUserType = z.infer<typeof SearchUserSchema>;
