import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cookies from "js-cookie";

const AxiosInstance = axios.create({
    baseURL: 'http://dentzone.runasp.net/',
});

AxiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const token = Cookies.get('authToken');
        if (token && config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`, "Accept",);
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

AxiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        if ([401, 403].includes(status ?? 0)) {
            await AsyncStorage.removeItem('Token');
            Cookies.remove('authToken');
            Cookies.remove('userRole');
            Cookies.remove('userId');
            window.location.href = '/en';
        } else if ([400, 404, 500].includes(status ?? 0)) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;
