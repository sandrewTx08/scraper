import { CheerioAPI } from "cheerio";

type Return<T> = { [K in keyof T]: ($: CheerioAPI) => T[K] };

export { Return };
