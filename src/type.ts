import { Cheerio, CheerioAPI } from "cheerio";

type Strategy<T> = { [K in keyof T]: ($: CheerioAPI) => Cheerio<any> };

type Result<T> = { [K in keyof Strategy<T>]: ReturnType<Strategy<T>[K]> };

export { Strategy, Result };
