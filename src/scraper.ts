import { Cheerio, CheerioAPI, load } from "cheerio";
import { createServer } from "http";

function createScraper<
  T,
  Strategy extends { [K in keyof T]: <R>($: CheerioAPI) => Cheerio<R> },
  Result extends { [K in keyof Strategy]: ReturnType<Strategy[K]> }
>(strategy: Strategy) {
  function parser(html: any): Result {
    const object = Object();

    Object.keys(strategy).forEach((key) => {
      const callback = strategy[<keyof Strategy>key];
      const data = callback(load(html));
      object[key] = data;
    });

    return object;
  }

  function staticRequest(url: string): Promise<Result>;
  function staticRequest(url: string, callback: (result: Result) => void): void;
  function staticRequest(urls: string[]): Promise<Result[]>;
  function staticRequest(
    urls: string[],
    callback: (results: Result[]) => void
  ): void;
  async function staticRequest<
    T extends string | string[],
    R extends T extends string[] ? Result[] : Result
  >(url: T, callback?: (result: R) => void): Promise<R | void> {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      data[i] = fetch(url instanceof Array ? url[i] : url)
        .then((response) => response.text())
        .then((text) => parser(text));
    }

    const data_result = <R>(
      await (url instanceof Array ? Promise.all(data) : data[0])
    );
    if (callback) callback(data_result);
    else return data_result;
  }

  function createRouter<T extends typeof staticRequest>(
    port: number,
    request: T
  ) {
    return createServer((req, res) => {
      const url = req.url!.slice(1);
      request(url, (result) => {
        const object = Object();

        Object.keys(result).forEach((key) => {
          object[key] = result[<keyof Result>key].toArray();
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(object));
      });
    }).listen(port);
  }

  return {
    createRouter,
    request: { staticRequest },
    parser,
  };
}

export { createScraper };
