import axios, { AxiosRequestConfig } from "axios";
import {
  ModeArray,
  ModeCallback,
  ModeObject,
  Modes,
  ModesReturn,
  Result,
} from "./types";
import { load } from "cheerio";
import { Router } from "express";
import { URL, parse } from "url";

function createScraper<Mode extends Modes>(mode: Mode) {
  function parser(html: string): ModesReturn<Mode> {
    const $page = load(html);

    return mode instanceof Function
      ? mode($page)
      : mode instanceof Array
      ? mode.map((callback) => callback($page))
      : mode instanceof Object
      ? (() => {
          const object = Object();

          for (const key of Object.keys(mode)) object[key] = mode[key]($page);

          return object;
        })()
      : TypeError("Invalid type mode.");
  }

  function express(options: { hostname: string; request: typeof staticPage }) {
    const url_parse = parse(options.hostname);

    return Router().get(url_parse.pathname!, (req, res, next) => {
      let hostname_url: string = options.hostname;

      for (const key of Object.keys(req.params)) {
        hostname_url = options.hostname.replace(":" + key, req.params[key]);
      }

      for (const key of Object.keys(req.query)) {
        const url = new URL(hostname_url);
        url.searchParams.append(key, req.query[key] as string);
        hostname_url = url.toString();
      }

      options
        .request(hostname_url)
        .then((result) => {
          res.json(
            result instanceof Array
              ? result.map((callback) => callback.toArray())
              : "toArray" in result
              ? (result as Result).toArray()
              : result instanceof Object
              ? (() => {
                  const object = Object();

                  for (const key of Object.keys(result))
                    object[key] = result[key].toArray();

                  return object;
                })()
              : TypeError("Error sending data.")
          );
        })
        .catch(next);
    });
  }

  function staticPage(
    config: AxiosRequestConfig<any>
  ): Promise<ModesReturn<Mode>>;
  function staticPage(
    config: AxiosRequestConfig<any>,
    callback: (result: ModesReturn<Mode>) => void
  ): void;
  function staticPage(
    configs: AxiosRequestConfig<any>[]
  ): Promise<ModesReturn<Mode>[]>;
  function staticPage(
    configs: AxiosRequestConfig<any>[],
    callback: (results: ModesReturn<Mode>[]) => void
  ): void;
  function staticPage(url: string): Promise<ModesReturn<Mode>>;
  function staticPage(
    url: string,
    callback: (result: ModesReturn<Mode>) => void
  ): void;
  function staticPage(urls: string[]): Promise<ModesReturn<Mode>[]>;
  function staticPage(
    urls: string[],
    callback: (results: ModesReturn<Mode>[]) => void
  ): void;
  function staticPage<
    T extends string | AxiosRequestConfig<any>,
    R extends T extends any[] ? ModesReturn<Mode>[] : ModesReturn<Mode>
  >(urlOrConfigs: T, callback?: (result: R) => void) {
    const data = [];

    for (
      let i = 0;
      i < (urlOrConfigs instanceof Array ? urlOrConfigs.length : 1);
      i++
    ) {
      data[i] = axios(
        urlOrConfigs instanceof Array ? urlOrConfigs[i] : urlOrConfigs
      ).then((response) => parser(response.data));
    }

    const result = <Promise<R>>(
      (urlOrConfigs instanceof Array ? Promise.all(data) : data[0])
    );
    if (callback) result.then(callback);
    else return result;
  }

  return { request: { staticPage }, express };
}

export {
  createScraper,
  ModeCallback,
  ModesReturn,
  ModeObject,
  Modes,
  ModeArray,
};
