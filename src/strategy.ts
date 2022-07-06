import { Axios, AxiosRequestConfig } from "axios";
import { Scrape, ScrapeCallback } from "./scrape";

export type ScrapeConfiguration<T> = {
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

export interface IStrategy<T> {
  request: (arg: number, arg2: number) => Promise<Record<keyof T, any[]>[]>;
}

export class Strategy<T> implements IStrategy<T> {
  readonly session: Axios = new Axios({});
  readonly scraper: Scrape<T>;

  constructor(readonly configuration: ScrapeConfiguration<T>) {
    this.configureKeywords();
    this.scraper = new Scrape<T>(configuration.strategy);
  }

  private configureKeywords() {
    return (this.configuration.request.params = {
      ...this.configuration.request.params,
      ...(this.configuration.keywords && {
        [this.configuration.keywords.queryString]:
          this.configuration.keywords.value,
      }),
    });
  }

  private incrementIndex(index?: number) {
    return (this.configuration.request.params[
      this.configuration.index.queryString
    ] = !this.configuration.request.params[this.configuration.index.queryString]
      ? this.configuration.request.params[
          this.configuration.index.queryString
        ] === 0
        ? (this.configuration.request.params[
            this.configuration.index.queryString
          ] =
            this.configuration.request.params[
              this.configuration.index.queryString
            ] + this.configuration.index.options.increment)
        : this.configuration.index.options.initial! +
          (index || 0) * this.configuration.index.options.increment!
      : (this.configuration.request.params[
          this.configuration.index.queryString
        ] =
          this.configuration.request.params[
            this.configuration.index.queryString
          ] + this.configuration.index.options.increment));
  }

  /**
   * Request a number of pages, then return an array of scrape result.
   * @param {number} size Represents number of request and increment on index.
   * @param {number | undefined} skip Skip indexes of pages.
   * @return {Promise<Record<keyof T, any[]>[]>} Scrape result objects.
   */
  request<R = Promise<Record<keyof T, any[]>[]>>(
    size: number,
    skip?: number
  ): R {
    const data: Promise<T>[] = [];
    for (let i = 0; i < size; i++) {
      this.incrementIndex(skip);
      data[i] = this.session
        .request(this.configuration.request)
        .then((response) => this.scraper.parse(response.data));
    }
    return <R>(<any>Promise.all(data));
  }
}
