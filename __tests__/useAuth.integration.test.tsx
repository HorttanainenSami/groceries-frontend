import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '@/hooks/useAuth';
import { AuthContextProvider } from '@/contexts/AuthenticationContext';
import * as serverAPI from '@/service/serverAPI';
import { getAxiosInstance } from '@/service/AxiosInstance';
import { LoginResponseType } from '@groceries/shared_types';

jest.mock('@/service/serverAPI', () => ({
  loginAPI: jest.fn(),
  signupAPI: jest.fn(),
  refreshToken: jest.fn(),
  TokenError: class TokenError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'TokenError';
    }
  },
}));

jest.mock('@/hooks/useAlert', () => ({
  __esModule: true,
  default: () => ({ addAlert: jest.fn() }),
}));

const mockUser: LoginResponseType = {
  id: 'user-123',
  email: 'test@example.com',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

const newTokens: LoginResponseType = {
  ...mockUser,
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
};

const wrapper = ({ children }: React.PropsWithChildren) => (
  <AuthContextProvider>{children}</AuthContextProvider>
);

const mockAdapter = (responses: Array<{ status: number; data: object }>) => {
  let call = 0;
  getAxiosInstance().defaults.adapter = async (config: any) => {
    const r = responses[Math.min(call++, responses.length - 1)];
    if (r.status >= 400) {
      const err: any = new Error('Request failed with status ' + r.status);
      err.isAxiosError = true;
      err.response = { status: r.status, data: r.data, config, headers: {} };
      err.config = config;
      throw err;
    }
    return { status: r.status, data: r.data, config, headers: {}, statusText: 'OK' };
  };
};

describe('useAuth refresh token interceptor', () => {
  let unmount: () => void;

  beforeEach(async () => {
    jest.clearAllMocks();
    delete (getAxiosInstance().defaults as any).adapter;
    // Pre-populate storage so the hook restores the user on mount
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
  });

  afterEach(() => {
    unmount?.();
    AsyncStorage.clear();
  });

  it('calls refreshToken and uses new access token on retry', async () => {
    (serverAPI.refreshToken as jest.Mock).mockResolvedValue(newTokens);
    const rendered = await renderHook(() => useAuth(), { wrapper });
    const { result } = rendered;
    unmount = rendered.unmount;

    await waitFor(() => expect(result.current.user?.accessToken).toBe(mockUser.accessToken));

    const capturedAuthHeaders: string[] = [];
    const spyId = getAxiosInstance().interceptors.request.use((config) => {
      capturedAuthHeaders.push(config.headers['Authorization'] as string);
      return config;
    });

    mockAdapter([
      { status: 401, data: { error: 'token_expired' } },
      { status: 200, data: { ok: true } },
    ]);

    await act(async () => {
      await getAxiosInstance()
        .get('/test')
        .catch(() => {});
    });

    getAxiosInstance().interceptors.request.eject(spyId);

    await waitFor(() => {
      expect(serverAPI.refreshToken).toHaveBeenCalledWith({ refreshToken: mockUser.refreshToken });
      expect(result.current.user?.accessToken).toBe(newTokens.accessToken);
      expect(result.current.user?.refreshToken).toBe(newTokens.refreshToken);
      // retry used the new access token
      expect(capturedAuthHeaders.at(-1)).toBe(`Bearer ${newTokens.accessToken}`);
    });
  });

  it('logs out when refresh fails with TokenError', async () => {
    const TokenErrorClass = (serverAPI as any).TokenError;
    (serverAPI.refreshToken as jest.Mock).mockRejectedValue(
      new TokenErrorClass('Refresh token expired')
    );
    const rendered = await renderHook(() => useAuth(), { wrapper });
    const { result } = rendered;
    unmount = rendered.unmount;

    await waitFor(() => expect(result.current.user?.accessToken).toBe(mockUser.accessToken));

    mockAdapter([{ status: 401, data: { error: 'token_expired' } }]);

    await act(async () => {
      await getAxiosInstance()
        .get('/test')
        .catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.user).toBeUndefined();
    });
  });

  it('logs out on 401 without token_expired', async () => {
    const rendered = await renderHook(() => useAuth(), { wrapper });
    const { result } = rendered;
    unmount = rendered.unmount;

    await waitFor(() => expect(result.current.user?.accessToken).toBe(mockUser.accessToken));

    mockAdapter([{ status: 401, data: {} }]);

    await act(async () => {
      await getAxiosInstance()
        .get('/test')
        .catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.user).toBeUndefined();
      expect(serverAPI.refreshToken).not.toHaveBeenCalled();
    });
  });

  it('does not logout or refresh on non-401 errors', async () => {
    const rendered = await renderHook(() => useAuth(), { wrapper });
    const { result } = rendered;
    unmount = rendered.unmount;

    await waitFor(() => expect(result.current.user?.accessToken).toBe(mockUser.accessToken));

    mockAdapter([{ status: 500, data: { error: 'server error' } }]);

    await act(async () => {
      await getAxiosInstance()
        .get('/test')
        .catch(() => {});
    });

    expect(serverAPI.refreshToken).not.toHaveBeenCalled();
    expect(result.current.user).toStrictEqual(mockUser);
  });
});
