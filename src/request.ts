import { ObjectReturn } from "./type";
import axios from "axios";
import { Scraper } from "./scraper";

class Request<T> {
  constructor(protected scraper: Scraper<T>) {}
}

class StaticRequest<T> extends Request<T> {
  request(url: string): Promise<ObjectReturn<T>>;
  request(url: string, callback: (result: ObjectReturn<T>) => void): void;
  request(urls: string[]): Promise<ObjectReturn<T>[]>;
  request(urls: string[], callback: (results: ObjectReturn<T>[]) => void): void;
  async request<
    T extends string | string[],
    R extends T extends string[] ? ObjectReturn<T>[] : ObjectReturn<T>
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
