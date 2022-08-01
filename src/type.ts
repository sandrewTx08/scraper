import { CheerioAPI } from "cheerio";

type Strategy<T> = { [K in keyof T]: ($: CheerioAPI) => T[K] };

type Result<T> = { [K in keyof Strategy<T>]: ReturnType<Strategy<T>[K]> };

export { Strategy, Result };
