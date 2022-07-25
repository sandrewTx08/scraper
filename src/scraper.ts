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

export function request<
  T,
  F extends <R>($: CheerioAPI) => Cheerio<R>,
  D extends { [KD in keyof T]: F }
>(
  strategy: D,
  options: Configurations
): Promise<{ [KR in keyof D]: ReturnType<D[KR]> }[]> {
  function parse(html: string) {
    const $page = load(html);
    const object = Object();

    Object.keys(strategy).map((key) => {
      const data = [];
      const callback = strategy[<keyof T>key];
      const d = callback($page);
      data.push(d);
      object[key] = data;
    });

    return object;
  }

  const data = [];
  for (let i = 0; i < 1; i++) {
    data[i] = options.session
      .request(options.request)
      .then((response) => parse(response.data));
  }

  return Promise.all(data);
}
