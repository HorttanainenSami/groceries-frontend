import z from 'zod';

export const LoginResponseSchema = z.object({
  email: z.string().email(),
  id: z.string().uuid(),
  token: z.string(),
});

export type loginResponse = z.infer<typeof LoginResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const BaseTaskSchema = z.object({
  id: z.string().uuid(),
  task: z.string(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  completed_by: z.string().uuid().nullable(),
  task_relations_id: z.string().uuid(),
  order_idx: z.number().optional(),
});

export type BaseTaskType = z.infer<typeof BaseTaskSchema>;

export const BaseTaskRelationsSchema = z.object({
  id: z.string().uuid(),
  relation_location: z.enum(['Local', 'Server']),
  name: z.string(),
  created_at: z.string().datetime(),
});
export type BaseTaskRelationsType = z.infer<typeof BaseTaskRelationsSchema>;
export const LocalTaskRelationSchema = BaseTaskRelationsSchema.extend({
  relation_location: z.literal('Local').default('Local'),
});
export type LocalTaskRelationType = z.infer<typeof LocalTaskRelationSchema>;

export const ServerTaskRelationSchema = BaseTaskRelationsSchema.extend({
  relation_location: z.literal('Server').default('Server'),
  my_permission: z.string(),
  shared_with_id: z.string().uuid(),
  shared_with_name: z.string(),
  shared_with_email: z.string().email(),
});
export type ServerTaskRelationType = z.infer<typeof ServerTaskRelationSchema>;

export const BaseTaskRelationsWithTasksSchema = BaseTaskRelationsSchema.extend({
  tasks: z.array(BaseTaskSchema),
});
export type BaseTaskRelationsWithTasksType = z.infer<
  typeof BaseTaskRelationsWithTasksSchema
>;
export const LocalTaskRelationsWithTasks =
  BaseTaskRelationsWithTasksSchema.extend({
    relation_location: z.literal('Local').default('Local'),
  });
export type LocalTaskRelationsWithTasksType = z.infer<
  typeof LocalTaskRelationsWithTasks
>;
export const ServerTaskRelationsWithTasksSchema =
  BaseTaskRelationsSchema.extend({
    relation_location: z.literal('Server').default('Server'),
    tasks: z.array(BaseTaskSchema),
  });
export type ServerTaskRelationsWithTasksType = z.infer<
  typeof ServerTaskRelationsWithTasksSchema
>;
export type LocalRelationsWithTasksType = z.infer<
  typeof LocalTaskRelationsWithTasks
>;

export type TaskType = z.infer<typeof BaseTaskSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3, 'Password must be atleast 3 characters long'),
});
export type LoginType = z.infer<typeof LoginSchema>;

export type editTaskProps = Pick<TaskType, 'id' | 'task'>;

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
