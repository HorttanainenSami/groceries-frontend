import axios, { AxiosInstance} from "axios";
import Constants from "expo-constants";



let axiosInstance:AxiosInstance|null = null;


export const getAxiosInstance = ():AxiosInstance => {
    if(axiosInstance === null) {
        axiosInstance = axios.create({
            baseURL: `http:${Constants.experienceUrl.split(":")[1]}:3003`,
        });
    }
    return axiosInstance;
}
