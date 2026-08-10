import { Auth } from './auth';

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: Auth;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    [key: string]: unknown;
};

export type * from './auth';
