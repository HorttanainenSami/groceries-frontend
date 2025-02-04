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

export type checkboxText = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  checkedAt?: Date;
  checkedBy?: string;
}
