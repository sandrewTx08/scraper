import { AxiosRequestConfig, AxiosStatic } from "axios";
import { Cheerio, CheerioAPI, load } from "cheerio";

export type Configurations<T = any> = {
  strategy?: T;
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
  Callback extends <El>($: CheerioAPI) => Cheerio<El>,
  Strategy extends { [K in keyof T]: Callback },
  Result extends { [K in keyof Strategy]: ReturnType<Strategy[K]> }
> {
  constructor(options: Required<Configurations<Strategy>>);
  constructor(
    options: Omit<Configurations<Strategy>, "strategy">,
    strategy: Strategy
  );
  constructor(
    public readonly options: Configurations<Strategy>,
    public readonly strategy?: Strategy
  ) {}

  request(): Promise<Result[]> {
    const data = [];

    for (
      let i = 0;
      i < (this.options.url instanceof Array ? this.options.url.length : 1);
      i++
    ) {
      this.options.request.url =
        this.options.url instanceof Array
          ? this.options.url[i]
          : this.options.url;
      data[i] = this.options.session
        .request(this.options.request)
        .then((response) => this.parse(response.data));
    }

    return Promise.all(data);
  }

  parse(html: string): Result {
    const object = Object();

    Object.keys(this.strategy ? this.strategy : this.options.strategy!).forEach(
      (key) => {
        const data = [];
        const callback = (
          this.strategy ? this.strategy : this.options.strategy!
        )[<keyof T>key];
        const $page = load(html);
        const callback_data = callback($page);
        data.push(callback_data);
        object[key] = data;
      }
    );

    return object;
  }
}
