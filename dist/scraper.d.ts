import { Axios, AxiosRequestConfig } from "axios";
import { CheerioAPI } from "cheerio";
export declare type ScraperConfiguration<T> = {
    /**
     * Keywords configuration.
     * @example
     * // URL = www.website.com/?query="Windows 10"&page=1
     * keywords: {
     *   queryString: "query";
     *   value: "Windows 10";
     * };
     */
    keywords?: {
        queryString: string;
        value: string;
    };
    /**
     * Index increment strategy.
     * @example
     * // URL1 = www.website.com/?query="Linux"&page=10
     * // URL2 = www.website.com/?query="Linux"&page=20
     * index: {
     *   queryString: "page";
     *   options: {
     *     increment: 10;
     *     initial: null;
     *   };
     * };
     */
    index: {
        queryString: string;
        options: {
            increment: number | null;
            initial: number | null;
        };
    };
    /**
     * Request configuration.
     */
    request: AxiosRequestConfig;
    /**
     * Represent returning JQuery data manipulation.
     * @example
     * {
     *   description: ($, push) => {
     *     $("div").each((i, el) => {
     *       push($(el).text());
     *     });
     *   },
     *   link: ($, push) => {
     *     $("a[href]").each((i, el) => {
     *       push($(el).attr("href") || "");
     *     });
     *   },
     *   title: ($, push) => {
     *     $("h3").each((i, el) => {
     *       push($(el).text());
     *     });
     *   },
     * },
     */
    strategy: ScrapeCallback<T>;
};
export declare type ScrapeCallback<T> = {
    [K in keyof T]: <P extends Array<any>["push"]>($: CheerioAPI, push: P) => void;
};
export interface IScraper<T, D> {
    session: unknown;
    configuration: ScraperConfiguration<T>;
    parse: (arg: string) => D;
    request: (arg: number, arg2: number) => Promise<D[]>;
}
export declare class Scraper<T, D = {
    [K in keyof T]: any[];
}> implements IScraper<T, D> {
    readonly configuration: ScraperConfiguration<T>;
    readonly session: Axios;
    constructor(configuration: ScraperConfiguration<T>);
    private configureKeywords;
    private incrementIndex;
    parse(html: string): D;
    /**
     * Request a number of pages, then return an array of scrape result.
     * @param {number} size Represents number of request and increment on index.
     * @param {number | undefined} skip Skip indexes of pages.
     * @return {Promise<D[]>} Scrape result objects.
     */
    request(size: number, skip?: number): Promise<D[]>;
}
