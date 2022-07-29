import { AxiosRequestConfig, AxiosStatic } from "axios";
import { Cheerio, CheerioAPI, load } from "cheerio";

export type Configurations<T = any> = {
  strategy: T;
  /**
   * Service used to request data.
   */
  session: AxiosStatic;
  /**
   * Request configuration.
   */
  request: AxiosRequestConfig;
};

export class Scraper<
  T,
  Strategy extends { [K in keyof T]: <El>($: CheerioAPI) => Cheerio<El> },
  Result extends { [K in keyof Strategy]: ReturnType<Strategy[K]> }
> {
  constructor(options: Configurations<Strategy>);
  constructor(
    options: Omit<Configurations<Strategy>, "strategy">,
    strategy: Strategy
  );
  constructor(
    public readonly options: Configurations<Strategy>,
    public readonly strategy?: Strategy
  ) {}

  request(url: string): Promise<Result>;
  request(url: string, callback: (result: Result) => void): Promise<Result>;
  request(urls: string[]): Promise<Result[]>;
  request(
    urls: string[],
    callback: (results: Result[]) => void
  ): Promise<Result[]>;
  async request<
    T extends string | string[],
    R extends T extends string[] ? Result[] : Result
  >(
    /**
     * URLs to scrape.
     */
    url: T,
    callback?: (result: R) => void
  ): Promise<R> {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      this.options.request.url = url instanceof Array ? url[i] : url;
      data[i] = this.options.session
        .request(this.options.request)
        .then((response) => this.parser(response.data));
    }

    if (url instanceof Array) {
      const data_result: any = await Promise.all(data);
      if (callback) callback(data_result);
      return data_result;
    } else {
      const data_result: any = await data[0];
      if (callback) callback(data_result);
      return data_result;
    }
  }

  parser(html: string): Result {
    const object = Object();
    const $page = load(html);

    Object.keys(this.strategy ? this.strategy : this.options.strategy).forEach(
      (key) => {
        const callback = (
          this.strategy ? this.strategy : this.options.strategy
        )[<keyof Strategy>key];
        const data = callback($page);
        object[key] = data;
      }
    );

    return object;
  }
}
