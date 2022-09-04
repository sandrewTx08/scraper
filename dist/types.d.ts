import { Cheerio, CheerioAPI } from "cheerio";
import { Router } from "express";
export interface IModeClass<T extends Modes> {
    parser(html: string): ModesReturn<T>;
    createRouter(request: Function, hostname: string): Router;
}
export declare type Result = Cheerio<any>;
export declare type ModeCallback = ($: CheerioAPI) => Result;
export declare type ModeObject = {
    [x: string]: ModeCallback;
};
export declare type ModeArray = ModeCallback[];
export declare type ModesReturn<T extends Modes> = T extends ModeObject ? {
    [K in keyof T]: ReturnType<T[K]> extends Result ? ReturnType<T[K]> : never;
} : T extends ModeCallback ? ReturnType<T> extends Result ? ReturnType<T> : never : T extends (infer I extends ModeCallback)[] ? ReturnType<I>[] extends Result[] ? ReturnType<I>[] : never : never;
export declare type Modes = ModeObject | ModeCallback | ModeArray;
