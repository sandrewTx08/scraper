import { Axios, AxiosRequestConfig } from "axios";
import { CheerioAPI, load } from "cheerio";

export type ScraperConfiguration<T> = {
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

export type ScrapeCallback<T> = {
  [K in keyof T]: <P extends Array<any>["push"]>(
    $: CheerioAPI,
    push: P
  ) => void;
};

export interface IScraper<T, D> {
  session: unknown;
  configuration: ScraperConfiguration<T>;
  parse: (arg: string) => D;
  request: (arg: number, arg2: number) => Promise<D[]>;
}

export class Scraper<T, D = Record<keyof ScrapeCallback<T>, any[]>>
  implements IScraper<T, D>
{
  readonly session: Axios = new Axios({});

  constructor(readonly configuration: ScraperConfiguration<T>) {
    this.configureKeywords();
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

  parse(html: string): D {
    type StrategyKeys = keyof ScrapeCallback<T>;
    const $page = load(html);
    const object = Object();

    Object.keys(this.configuration.strategy).map((key) => {
      const data: any[] = [];
      const callback = this.configuration.strategy[<StrategyKeys>key];
      callback($page, (arg) => data.push(arg));
      object[<StrategyKeys>key] = data;
    });

    return object;
  }

  /**
   * Request a number of pages, then return an array of scrape result.
   * @param {number} size Represents number of request and increment on index.
   * @param {number | undefined} skip Skip indexes of pages.
   * @return {Promise<D[]>} Scrape result objects.
   */
  request(size: number, skip?: number): Promise<D[]> {
    const data = [];

    for (let i = 0; i < size; i++) {
      this.incrementIndex(skip);
      data[i] = this.session
        .request(this.configuration.request)
        .then((response) => this.parse(response.data));
    }

    return Promise.all(data);
  }
}
