
import { Cheerio, CheerioAPI } from "cheerio";
import { Express } from "express";

export interface IModeClass<T extends Modes> {
    parser(html: string): ModesReturn<T>
    createExpress(request: Function, hostname: string): Express
}

export type ModeCallback = ($: CheerioAPI) => Cheerio<any>;

export type ModeObject = { [x: string]: ModeCallback };

export type ModeArray = ModeCallback[];

export type ModesReturn<T extends Modes> = T extends ModeObject ? { [K in keyof T]:
    ReturnType<T[K]> extends Cheerio<any> ? ReturnType<T[K]> : never }
    : T extends ModeCallback ?
    ReturnType<T> extends Cheerio<any> ? ReturnType<T> : never
    : T extends (infer I extends ModeCallback)[] ?
    ReturnType<I>[] extends Cheerio<any>[] ? ReturnType<I>[] : never
    : never;

export type Modes = ModeObject | ModeCallback | ModeArray;
