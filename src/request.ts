import { Result } from "./type";
import axios from "axios";
import { Scraper } from "./scraper";

class Request {
  constructor(protected scraper: Scraper<unknown>) {}
}

class StaticRequest<T> extends Request {
  request(url: string): Promise<Result<T>>;
  request(url: string, callback: (result: Result<T>) => void): void;
  request(urls: string[]): Promise<Result<T>[]>;
  request(urls: string[], callback: (results: Result<T>[]) => void): void;
  async request<
    T extends string | string[],
    R extends T extends string[] ? Result<T>[] : Result<T>
  >(url: T, callback?: (result: R) => void): Promise<R | void> {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      data[i] = axios(url instanceof Array ? url[i] : url).then((response) =>
        this.scraper.parser(response.data)
      );
    }

    const data_result = <R>(
      await (url instanceof Array ? Promise.all(data) : data[0])
    );
    if (callback) callback(data_result);
    else return data_result;
  }
}

export { Request, StaticRequest };
