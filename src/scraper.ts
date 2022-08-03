import axios from "axios";
import { load } from "cheerio";
import express from "express";
import { Cheerio, CheerioAPI } from "cheerio";

type ReturnArray = (($: CheerioAPI) => Cheerio<any>)[];

type ReturnObject<T> = { [K in keyof T]: ($: CheerioAPI) => Cheerio<any> };

type ReturnCallback = ($: CheerioAPI) => Cheerio<any>;

type Return<T> = ReturnObject<T> | ReturnArray | ReturnCallback;

function createScraper<T>(strategy: Return<T>) {
  function parser(html: string) {
    const $page = load(html);

    function returnObject<T>(strategy: ReturnObject<T>): {
      [K in keyof T]: Cheerio<any>;
    } {
      const object = Object();

      Object.keys(strategy).forEach((key) => {
        const callback = strategy[<keyof typeof strategy>key];
        object[key] = callback($page);
      });

      return object;
    }

    function returnArray(strategy: ReturnArray): Cheerio<any>[] {
      return strategy.map((callback) => callback($page));
    }

    function returnCallback(strategy: ReturnCallback): Cheerio<any> {
      return strategy($page);
    }

    return strategy instanceof Array
      ? returnArray(strategy)
      : typeof strategy === "function"
      ? returnCallback(strategy)
      : returnObject(strategy);
  }

  function createRouter(request: Function, hostname: string) {
    const app = express();

    app.use((req, res) => {
      const url = hostname + req.url.slice(1);

      request(url, (result: any) => {
        if (result instanceof Array)
          return result.map((v) => {
            res.json(result.map((v) => v.toArray()));
          });
        else {
          try {
            const object = Object();

            Object.keys(result).forEach((key) => {
              object[key] = result[key].toArray();
            });

            res.json(object);
          } catch {
            res.json(result.toArray());
          }
        }
      });
    });

    return app;
  }

  type S = typeof strategy;

  type RT = S extends ReturnArray
    ? Cheerio<any>[]
    : S extends ReturnObject<T>
    ? Cheerio<any>
    : {
        [K in keyof T]: Cheerio<any>;
      };

  async function staticRequest<
    T extends string | string[],
    R extends T extends string[] ? RT[] : RT
  >(url: T, callback?: (result: R) => void) {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      data[i] = axios(url instanceof Array ? url[i] : url).then((response) =>
        parser(response.data)
      );
    }

    const data_result = <R>(
      await (url instanceof Array ? Promise.all(data) : data[0])
    );

    if (callback) callback(data_result);
    else return data_result;
  }

  return {
    createRouter,
    parser,
    staticRequest,
  };
}

export { createScraper };
export { Return, ReturnObject, ReturnArray, ReturnCallback };
