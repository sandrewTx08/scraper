import { load } from "cheerio";
import { createServer } from "http";
import { StaticRequest } from "./request";
import { Return } from "./type";

class Scraper<T> {
  request: StaticRequest<T>;

  constructor(
    request: typeof StaticRequest,
    public readonly strategy: Return<T>
  ) {
    this.request = new request<T>(this);
  }

  parser<T extends string>(html: T): Return<T> {
    if (!(this.strategy instanceof Array)) {
      const object = Object();

      Object.keys(this.strategy).forEach((key) => {
        const callback = (<any>this.strategy)[<keyof typeof this.strategy>key];
        const data = callback(load(html));
        object[key] = data;
      });

      return object;
    } else return this.strategy.map((v) => v(load(html)));
  }

  createRouter(port: number) {
    return createServer((req, res) => {
      const url = req.url!.slice(1);

      this.request.request(url, (result) => {
        res.writeHead(200, { "Content-Type": "application/json" });

        if (!(result instanceof Array)) {
          const object = Object();

          Object.keys(result).forEach((key) => {
            object[key] = (<any>(
              result[<keyof typeof this.strategy>key]
            )).toArray();
          });

          res.end(JSON.stringify(object));
        } else res.end(JSON.stringify(result.map((v: any) => v.toArray())));
      });
    }).listen(port);
  }
}

export { Scraper };
