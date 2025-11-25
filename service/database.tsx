import {
  LoginResponseSchema,
  ErrorResponseSchema,
  ServerTaskRelationType,
  BaseTaskRelationsWithTasksType,
  ServerTaskRelationSchema,
  BaseTaskRelationsSchema,
  BaseTaskRelationsType,
} from '@/types';
import {
  SearchUserSchema,
  SearchUserType,
  LoginType,
  RegisterType,
} from '@/types';
import { getAxiosInstance } from '@/service/AxiosInstance';
import {postRelationAndShareWithUserRequestType} from '@groceries/shared_types';

//export const uri = 'http://5.61.90.231';
import Constants from 'expo-constants';
export const uri = `http:${Constants.experienceUrl.split(':')[1]}:3003`;

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
  try{

    console.log('credentials: ', credentials);
    const response = await getAxiosInstance().post(uri + '/signup', credentials);
    const parsedResponse = LoginResponseSchema.safeParse(response.data);
    if (parsedResponse.success) return parsedResponse.data;
  } catch (e) {
    console.error('Error during signup:', e);
    throw e;
  }
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
  try{

    const baseUrl = uri + `/user/search`;
    const url = buildQueryString(baseUrl, {
      name: searchParams,
      friends: friends ? 'true' : undefined,
    });
    console.log('url', url);
    const response = await getAxiosInstance().get(url);
    const parsedResponse = SearchUserSchema.array().parse(response.data);
    return parsedResponse;
  } catch (e) {
    console.error('Error searching users:', e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
    }
    throw e;
  }
};


export const shareListWithUser = async ({
  user_shared_with,
  task_relations,
}: postRelationAndShareWithUserRequestType) => {
  try{

    const postUrl = uri + `/relations/share`;
    const response = await getAxiosInstance().post(postUrl, {
      user_shared_with,
      task_relations,
    });
    if (response.status === 200) {
      console.log('response', response.data);
      const parsedData = ServerTaskRelationSchema.array().parse(response.data);
      return parsedData;
    } else {
      throw new Error('Something went wrong with response', response.data);
    }
  } catch (e) {
    console.error('Error sharing list with user:', e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
    }
    throw e;
  }
};

export const getServerRelations = async (): Promise<
  ServerTaskRelationType[]
> => {
  try {
    const getUrl = uri + '/relations';
    console.log('connecting to server relations', getUrl);
    const response = await getAxiosInstance().get(getUrl);
    console.log(JSON.stringify(response.data, null, 2));
    const parsedResponse = ServerTaskRelationSchema.array().parse(
      response.data
    );
    console.log(JSON.stringify(parsedResponse, null, 2));
    return parsedResponse;
  } catch (e) {
    console.log(e);
    return [];
  }
};


export const changeRelationNameOnServer = async (
  relationId: string,
  newName: string
): Promise<BaseTaskRelationsType> => {
  try {
    const postUrl = uri + `/relations/${relationId}`;
    const response = await getAxiosInstance().patch(postUrl, { relation_id: relationId, new_name: newName });
    const parsedResponse = BaseTaskRelationsSchema.parse(response.data);
    return parsedResponse;
  } catch (e) {
    console.error('Error changing relation name on server:', e);
    throw e;
  }
}


export const removeRelationFromServer = async (
  relationId: string
): Promise<[boolean, string]> => {
  try {
    const postUrl = uri + `/relations/${relationId}`;
    const response = await getAxiosInstance().delete(postUrl);
    if (response.status === 200) {
      return [true, relationId];
    }
    return [false, relationId];
  } catch (e) {
    console.error('Error removing relation from server:', e);
    throw e;
  }
};
