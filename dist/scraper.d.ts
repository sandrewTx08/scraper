import { AxiosRequestConfig } from "axios";
import { ModeArray, ModeCallback, ModeObject, Modes, ModesReturn } from "./types";
declare function createScraper<Mode extends Modes>(mode: Mode): {
    request: {
        staticPage: {
            (config: AxiosRequestConfig<any>): Promise<ModesReturn<Mode>>;
            (config: AxiosRequestConfig<any>, callback: (result: ModesReturn<Mode>) => void): void;
            (configs: AxiosRequestConfig<any>[]): Promise<ModesReturn<Mode>[]>;
            (configs: AxiosRequestConfig<any>[], callback: (results: ModesReturn<Mode>[]) => void): void;
            (url: string): Promise<ModesReturn<Mode>>;
            (url: string, callback: (result: ModesReturn<Mode>) => void): void;
            (urls: string[]): Promise<ModesReturn<Mode>[]>;
            (urls: string[], callback: (results: ModesReturn<Mode>[]) => void): void;
        };
    };
    express: (options: {
        hostname: string;
        request: {
            (config: AxiosRequestConfig<any>): Promise<ModesReturn<Mode>>;
            (config: AxiosRequestConfig<any>, callback: (result: ModesReturn<Mode>) => void): void;
            (configs: AxiosRequestConfig<any>[]): Promise<ModesReturn<Mode>[]>;
            (configs: AxiosRequestConfig<any>[], callback: (results: ModesReturn<Mode>[]) => void): void;
            (url: string): Promise<ModesReturn<Mode>>;
            (url: string, callback: (result: ModesReturn<Mode>) => void): void;
            (urls: string[]): Promise<ModesReturn<Mode>[]>;
            (urls: string[], callback: (results: ModesReturn<Mode>[]) => void): void;
        };
    }) => import("express-serve-static-core").Router;
};
export { createScraper, ModeCallback, ModesReturn, ModeObject, Modes, ModeArray, };
