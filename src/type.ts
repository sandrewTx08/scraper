import { CheerioAPI } from "cheerio";

type ArrayReturn = (<R>($: CheerioAPI) => R)[];

type ObjectReturn<T> = { [K in keyof T]: ($: CheerioAPI) => T[K] };

type Return<T> = ObjectReturn<T> | ArrayReturn;

export { Return, ObjectReturn };
