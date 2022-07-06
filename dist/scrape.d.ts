import { CheerioAPI } from "cheerio";
export declare type ScrapeCallback<D, T = any> = {
    [key in keyof D]: <Push extends Array<T>["push"]>($: CheerioAPI, push: Push) => void;
};
export interface IScrape<T> {
    strategy: ScrapeCallback<T>;
    parse: (arg: string) => T;
}
export declare class Scrape<T> implements IScrape<T> {
    readonly strategy: ScrapeCallback<T>;
    constructor(strategy: ScrapeCallback<T>);
    parse(html: string): { [key in keyof T]: any; };
}
