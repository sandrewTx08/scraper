import { load } from "cheerio";
import { createServer } from "http";
import { StaticRequest } from "./request";
import { Strategy } from "./type";

class Scraper<T> {
  request: StaticRequest<T>;

  constructor(
    request: typeof StaticRequest,
    public readonly strategy: Strategy<T>
  ) {
    this.request = new request(this);
  }

  parser<T extends Parameters<typeof load>[0]>(html: T) {
    const object = Object();

    Object.keys(this.strategy).forEach((key) => {
      const callback = this.strategy[<keyof typeof this.strategy>key];
      const data = callback(load(html));
      object[key] = data;
    });

    return object;
  }

  createRouter(port: number) {
    return createServer((req, res) => {
      const url = req.url!.slice(1);

      this.request.request(url, (result) => {
        const object = Object();

        Object.keys(result).forEach((key) => {
          object[key] = (<any>(
            result[<keyof typeof this.strategy>key]
          )).toArray();
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(object));
      });
    }).listen(port);
  }
}

export { Scraper };
