import axios, { AxiosInstance } from 'axios';

let axiosInstance: AxiosInstance | null = null;

export const getAxiosInstance = (): AxiosInstance => {
  if (axiosInstance === null) {
    axiosInstance = axios.create();
  }
  return axiosInstance;
};
