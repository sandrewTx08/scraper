import { load } from "cheerio";
import { createServer } from "http";
import { Strategy, Result } from "./type";

class Scraper<T> {
  constructor(public readonly strategy: Strategy<T>) {}

  parser<T extends Parameters<typeof load>[0]>(html: T) {
    const object = Object();

    Object.keys(this.strategy).forEach((key) => {
      const callback = this.strategy[<keyof typeof this.strategy>key];
      const data = callback(load(html));
      object[key] = data;
    });

    return object;
  }

  staticRequest(url: string): Promise<Result<T>>;
  staticRequest(url: string, callback: (result: Result<T>) => void): void;
  staticRequest(urls: string[]): Promise<Result<T>[]>;
  staticRequest(urls: string[], callback: (results: Result<T>[]) => void): void;
  async staticRequest<
    T extends string | string[],
    R extends T extends string[] ? Result<T>[] : Result<T>
  >(url: T, callback?: (result: R) => void): Promise<R | void> {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      data[i] = fetch(url instanceof Array ? url[i] : url)
        .then((response) => response.text())
        .then((text) => this.parser(text));
    }

    const data_result = <R>(
      await (url instanceof Array ? Promise.all(data) : data[0])
    );
    if (callback) callback(data_result);
    else return data_result;
  }

  createRouter<T extends typeof Scraper.prototype.staticRequest>(
    port: number,
    request: T
  ) {
    return createServer((req, res) => {
      const url = req.url!.slice(1);
      request(url, (result) => {
        const object = Object();

        Object.keys(result).forEach((key) => {
          object[key] = result[key].toArray();
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(object));
      });
    }).listen(port);
  }
}

export { Scraper };
