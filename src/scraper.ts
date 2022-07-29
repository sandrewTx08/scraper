import { AxiosRequestConfig, AxiosStatic } from "axios";
import { Cheerio, CheerioAPI, load } from "cheerio";

export type Settings<T = any> = {
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
  SettingOptions extends Settings<Strategy>,
  Strategy extends { [K in keyof T]: <El>($: CheerioAPI) => Cheerio<El> },
  Result extends { [K in keyof Strategy]: ReturnType<Strategy[K]> }
> {
  constructor(options: SettingOptions);
  constructor(options: Omit<SettingOptions, "strategy">, strategy: Strategy);
  constructor(
    public readonly options: SettingOptions,
    public readonly strategy?: Strategy
  ) {}

  request(url: string): Promise<Result>;
  request(url: string, callback: (result: Result) => void): void;
  request(urls: string[]): Promise<Result[]>;
  request(urls: string[], callback: (results: Result[]) => void): void;
  async request<
    T extends string | string[],
    R extends T extends string[] ? Result[] : Result
  >(
    /**
     * URLs to scrape.
     */
    url: T,
    callback?: (result: R) => void
  ): Promise<R | void> {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      this.options.request.url = url instanceof Array ? url[i] : url;
      data[i] = this.options.session
        .request(this.options.request)
        .then((response) => this.parser(response.data));
    }

    const data_result = <R>(
      await (url instanceof Array ? Promise.all(data) : data[0])
    );
    if (callback) callback(data_result);
    else return data_result;
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
