import api from './api';
import { ApiResponse, UserModule } from '@/types';

export const modulesApi = {
    getUserModules: () =>
        api.get<ApiResponse<UserModule[]>>('/modules/user-modules').then((r) => r.data),
};
