import z from 'zod';

export const LoginResponseSchema =z.object({
  email: z.string().email(),
  id: z.number(),
  token: z.string(), 
});

export type loginResponse = z.infer<typeof LoginResponseSchema>;

export const ErrorResponseSchema =z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const TaskSchema = z.object({
  id: z.number(),
  text: z.string(),
  created_at: z.string(),
  completed_at: z.string().nullable().optional(),
  completed_by: z.string().nullable().optional(),
  task_relations_id: z.number(),
})
export type TaskType = z.infer<typeof TaskSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3, 'Password must be atleast 3 characters long'),
});
export type LoginType = z.infer<typeof LoginSchema>;

export const TaskRelationsSchema = z.object({
  id: z.number(),
  name: z.string(),
  shared: z.boolean(),
  created_at: z.string(),
})
export type TaskRelationsType = z.infer<typeof TaskRelationsSchema>;

export type editTaskProps = Pick<TaskType, 'id'|'text'>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3, 'Password must be atleast 3 characters long'),
  confirm: z.string(),
}).refine(({password, confirm}) => password ===confirm, { message: 'Passwords must match', path:['confirm'] });
export type RegisterType = z.infer<typeof RegisterSchema>;
