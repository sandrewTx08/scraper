import { AxiosRequestConfig, AxiosStatic } from "axios";
import { Cheerio, CheerioAPI, load } from "cheerio";

export type Configurations = {
  /**
   * Service used to request data.
   */
  session: AxiosStatic;
  /**
   * URLs to scrape.
   */
  url: string | string[];
  /**
   *  Skip indexes of pages.
   */
  skip?: number;
  /**
   * Represents number of request and increment on index.
   */
  size: number;
  /**
   * Request configuration.
   */
  request: AxiosRequestConfig;
};

export class Scraper<
  T,
  F extends <R>($: CheerioAPI) => Cheerio<R>,
  D extends { [KD in keyof T]: F },
  R extends { [KR in keyof D]: ReturnType<D[KR]> }
> {
  constructor(
    public readonly strategy: D,
    public readonly options: Configurations
  ) {}

  request(): Promise<R[]> {
    const data = [];

    for (
      let i = 0;
      i < (this.options.url instanceof Array ? this.options.url.length : 1);
      i++
    ) {
      data[i] = this.options.session
        .request(this.options.request)
        .then((response) => this.parse(response.data));
    }

    return Promise.all(data);
  }

  parse(html: string): R {
    const $page = load(html);
    const object = Object();

    Object.keys(this.strategy).map((key) => {
      const data = [];
      const callback = this.strategy[<keyof T>key];
      const callback_data = callback($page);
      data.push(callback_data);
      object[key] = data;
    });

    return object;
  }
}
