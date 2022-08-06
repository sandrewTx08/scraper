import axios from "axios";
import { load } from "cheerio";
import express from "express";
import { Cheerio, CheerioAPI } from "cheerio";

type ModeObject = { [x: string]: ScrapeCallback };

type ModeObjectReturn<T extends ModeObject> = {
  [K in keyof T]: ReturnType<T[K]>;
};

type ScrapeCallback = ($: CheerioAPI) => Cheerio<any>;

function createScraper<Mode extends ModeObject>(mode: Mode) {
  function returnObject(html: string): ModeObjectReturn<Mode> {
    const $page = load(html);
    const object = Object();

    Object.keys(mode).forEach((key) => {
      const callback = mode[<keyof typeof mode>key];
      object[key] = callback($page);
    });

    return object;
  }

  function createExpress(request: Function, hostname: string) {
    const app = express();

    return app.use((req, res) => {
      const url = hostname + req.url.slice(1);

      try {
        request(url, (result: any) => {
          const object = Object();

          Object.keys(result).forEach((key) => {
            object[key] = result[key].toArray();
          });

          res.json(object);
        });
      } catch (error: any) {
        res.json(error.message);
      }
    });
  }

  function staticRequest(url: string): Promise<ModeObjectReturn<Mode>>;
  function staticRequest(
    url: string,
    callback: (result: ModeObjectReturn<Mode>) => void
  ): void;
  function staticRequest(urls: string[]): Promise<ModeObjectReturn<Mode>[]>;
  function staticRequest(
    urls: string[],
    callback: (results: ModeObjectReturn<Mode>[]) => void
  ): void;
  async function staticRequest<
    T extends string | string[],
    R extends T extends string[]
      ? ModeObjectReturn<Mode>[]
      : ModeObjectReturn<Mode>
  >(url: T, callback?: (result: R) => void) {
    const data = [];

    for (let i = 0; i < (url instanceof Array ? url.length : 1); i++) {
      data[i] = axios(url instanceof Array ? url[i] : url).then((response) =>
        returnObject(response.data)
      );
    }

    const data_result = <R>(
      await (url instanceof Array ? Promise.all(data) : data[0])
    );

    if (callback) callback(data_result);
    else return data_result;
  }

  return { staticRequest, createExpress };
}

export { ModeObject, ModeObjectReturn, ScrapeCallback, createScraper };
