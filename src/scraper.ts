import axios, { AxiosRequestConfig } from "axios";
import { load } from "cheerio";
import express, { Express } from "express";
import { Cheerio, CheerioAPI } from "cheerio";

type ScraperCallback = ($: CheerioAPI) => Cheerio<any>;

type ModeObject = { [x: string]: ScraperCallback };

type ModeCallback = ScraperCallback;

type ModeArray = ScraperCallback[];

type ModesReturn<T extends Modes> =
  T extends ModeObject ? {
    [K in keyof T]: ReturnType<T[K]>;
  }
  : T extends ModeCallback ? ReturnType<T>
  : T extends (infer I extends ScraperCallback)[] ? ReturnType<I>[]
  : never;

type Modes = ModeObject | ModeCallback | ModeArray;


function createScraper<Mode extends Modes>(mode: Mode) {
  interface IModeClass {
    parser(html: string): any
    createExpress(request: Function, hostname: string): Express
  }

  const ModeClass =
    mode instanceof Array
      ? class ModeArrayClass implements IModeClass {
        parser(html: string) {
          const $page = load(html);
          return mode.map((callback) => callback($page));
        }

        createExpress(request: Function, hostname: string) {
          const app = express();

          return app.use((req, res) => {
            const url = hostname + req.url.slice(1);

            try {
              request(url, (result: any) => {
                res.json(result.map((data: any) => (data.toArray())));
              });
            } catch (error: any) {
              res.json(error.message);
            }
          });
        }
      }
      : typeof mode === "function"
        ? class ModeCallbackClass implements IModeClass {
          parser(html: string) {
            const $page = load(html);
            return mode($page);
          }

          createExpress(request: Function, hostname: string) {
            const app = express();

            return app.use((req, res) => {
              const url = hostname + req.url.slice(1);

              try {
                request(url, (result: any) => {
                  res.json(result.toArray())
                });
              } catch (error: any) {
                res.json(error.message);
              }
            });
          }
        }
        : class ModeObjectClass implements IModeClass {
          parser(html: string) {
            const $page = load(html);
            const object = Object();

            Object.keys(mode).forEach((key) => {
              const callback = mode[<keyof typeof mode>key];
              object[key] = (<any>callback)($page);
            });

            return object;
          }

          createExpress(request: Function, hostname: string) {
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
        };

  const modeClass = new ModeClass();

  function staticPage(config: AxiosRequestConfig<any>): Promise<ModesReturn<Mode>>;
  function staticPage(config: AxiosRequestConfig<any>, callback: (result: ModesReturn<Mode>) => void): void;
  function staticPage(configs: AxiosRequestConfig<any>[]): Promise<ModesReturn<Mode>[]>;
  function staticPage(configs: AxiosRequestConfig<any>[], callback: (results: ModesReturn<Mode>[]) => void): void;
  function staticPage(url: string): Promise<ModesReturn<Mode>>;
  function staticPage(url: string, callback: (result: ModesReturn<Mode>) => void): void;
  function staticPage(urls: string[]): Promise<ModesReturn<Mode>[]>;
  function staticPage(urls: string[], callback: (results: ModesReturn<Mode>[]) => void): void;
  async function staticPage<T extends string | string[], R extends T extends string[] ? ModesReturn<Mode>[] : ModesReturn<Mode>>(urlOrConfigs: T, callback?: (result: R) => void) {
    const data = [];

    for (let i = 0; i < (urlOrConfigs instanceof Array ? urlOrConfigs.length : 1); i++) {
      data[i] = axios(urlOrConfigs instanceof Array ? urlOrConfigs[i] : urlOrConfigs).then((response) =>
        modeClass.parser(response.data)
      );
    }

    const data_result = <R>(
      await (urlOrConfigs instanceof Array ? Promise.all(data) : data[0])
    );

    if (callback) callback(data_result);
    else return data_result;
  }

  return { request: { staticPage }, express: modeClass.createExpress };
}

export { createScraper, ModeCallback, ModesReturn, ModeObject, ScraperCallback, Modes, ModeArray };
