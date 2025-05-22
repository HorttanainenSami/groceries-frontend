import {
  LoginResponseSchema,
  ErrorResponseSchema,
  RelationFromServerSchema,
  ServerTaskRelationType,
  BaseTaskRelationsWithTasksType,
  BaseTaskType,
  ServerTaskRelationsWithTasksType,
  ServerTaskRelationsWithTasksSchema,
  TaskType,
  BaseTaskRelationsSchema,
  BaseTaskSchema,
} from '@/types';
import {
  SearchUserSchema,
  SearchUserType,
  LoginType,
  RegisterType,
} from '@/types';
import Constants from 'expo-constants';
import { getAxiosInstance } from '@/service/AxiosInstance';

const uri = `http:${Constants.experienceUrl.split(':')[1]}:3003`;

export const loginAPI = async (credentials: LoginType) => {
  try {
    console.log(credentials);
    const url = uri + '/login';
    const response = await getAxiosInstance().post(url, credentials);
    console.log('response ', response);
    const parsedResponse = LoginResponseSchema.safeParse(response.data);
    if (parsedResponse.success) return parsedResponse.data;
    throw new Error('Something went wrong with response');
  } catch (e) {
    console.log('loginAPI catch', e);
    const parsedError = ErrorResponseSchema.safeParse(e);
    if (parsedError.success) {
      console.log('parsed error');
    } else {
      console.log('error occurred', parsedError.data);
    }
    throw e;
  }
};

export const signupAPI = async (credentials: RegisterType) => {
  console.log('credentials: ', credentials);
  const response = await getAxiosInstance().post(uri + '/signup', credentials);
  const parsedResponse = LoginResponseSchema.safeParse(response.data);
  if (parsedResponse.success) return parsedResponse.data;
};

const buildQueryString = (
  baseUrl: string,
  params: Record<string, string | undefined>
): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, value);
    }
  });

  return `${baseUrl}?${query.toString()}`;
};

export const searchUsers = async (
  searchParams: string,
  friends?: boolean
): Promise<SearchUserType[]> => {
  const baseUrl = uri + `/user/search`;
  const url = buildQueryString(baseUrl, {
    name: searchParams,
    friends: friends ? 'true' : undefined,
  });
  console.log('url', url);
  const response = await getAxiosInstance().get(url);
  const parsedResponse = SearchUserSchema.array().parse(response.data);
  return parsedResponse;
};

type shareListWithUsersProps = {
  user: SearchUserType;
  relationsToShare: BaseTaskRelationsWithTasksType[];
};
export const shareListWithUser = async ({
  user,
  relationsToShare,
}: shareListWithUsersProps) => {
  const postUrl = uri + `/relations/share`;
  const response = await getAxiosInstance().post(postUrl, {
    user_shared_with: user.id,
    task_relations: relationsToShare,
  });
  if (response.status === 200) {
    console.log('response', response.data);
    const parsedData = BaseTaskRelationsSchema
      .array()
      .parse(response.data);
    return parsedData;
  } else {
    throw new Error('Something went wrong with response', response.data);
  }
};

export const getServerRelations = async (): Promise<
  ServerTaskRelationType[]
> => {
  const getUrl = uri + '/relations';
  console.log('connecting to server relations', getUrl);
  const response = await getAxiosInstance().get(getUrl);
  const parsedResponse = RelationFromServerSchema.array().parse(response.data);
  console.log(JSON.stringify(parsedResponse, null, 2));
  return parsedResponse;
};

export const getServerTasksByRelationId = async (
  relationId: string
): Promise<ServerTaskRelationsWithTasksType> => {
  const getUrl = uri + `/relations/${relationId}`;
  console.log('connecting to server tasks', getUrl);
  const response = await getAxiosInstance().get(getUrl);
  const parsedResponse = ServerTaskRelationsWithTasksSchema.parse(response.data);
  return parsedResponse;
};
export const createTaskForServerRelation = async (
  relationId: string,
  task: Omit<BaseTaskType, 'id'>
) => {
  const postUrl = uri + `/relations/${relationId}/tasks`;
  const response = await getAxiosInstance().post(postUrl, { task });
  const parsedResponse = BaseTaskSchema.parse(response.data);
  console.log(parsedResponse);
  return parsedResponse;
};
export const editTaskFromServerRelation = async (
  relationId: string,
  task: Partial<BaseTaskType>
) => {
  const { id, ...rest } = task;
  const postUrl = uri + `/relations/${relationId}/tasks/${id}`;
  const response = await getAxiosInstance().patch(postUrl, rest);
  const parsedResponse = BaseTaskSchema.parse(
    response.data
  ) as TaskType;
  console.log(parsedResponse);
  return parsedResponse;
};

export const removeTaskFromServerRelation = async (
  relationId: string,
  taskId: string
) => {
  const postUrl = uri + `/relations/${relationId}/tasks/${taskId}`;
  const response = await getAxiosInstance().delete(postUrl);
  const parsedResponse = BaseTaskSchema.parse(
    response.data
  ) as TaskType;
  return parsedResponse;
};
export const removeRelationFromServer = async (
  relationId: string
): Promise<[boolean, string]> => {
  const postUrl = uri + `/relations/${relationId}`;
  const response = await getAxiosInstance().delete(postUrl);
  if (response.status === 200) {
    return [true, relationId];
  }
  return [false, relationId];
};
