import axios, { AxiosRequestConfig } from "axios";
import { ModeArrayClass, ModeCallbackClass, ModeObjectClass } from "./parser";
import { ModeArray, ModeCallback, ModeObject, Modes, ModesReturn } from "./types";

function createScraper<Mode extends Modes>(mode: Mode) {
  const modeClass = new (mode instanceof Array
    ? ModeArrayClass
    : typeof mode === "function"
      ? ModeCallbackClass
      : ModeObjectClass)(<any>mode);

  function staticPage(config: AxiosRequestConfig<any>): Promise<ModesReturn<Mode>>;
  function staticPage(config: AxiosRequestConfig<any>, callback: (result: ModesReturn<Mode>) => void): void;
  function staticPage(configs: AxiosRequestConfig<any>[]): Promise<ModesReturn<Mode>[]>;
  function staticPage(configs: AxiosRequestConfig<any>[], callback: (results: ModesReturn<Mode>[]) => void): void;
  function staticPage(url: string): Promise<ModesReturn<Mode>>;
  function staticPage(url: string, callback: (result: ModesReturn<Mode>) => void): void;
  function staticPage(urls: string[]): Promise<ModesReturn<Mode>[]>;
  function staticPage(urls: string[], callback: (results: ModesReturn<Mode>[]) => void): void;
  async function staticPage<T extends string | AxiosRequestConfig<any>, R extends T extends any[] ? ModesReturn<Mode>[] : ModesReturn<Mode>>(urlOrConfigs: T, callback?: (result: R) => void) {
    const data = [];

    for (let i = 0; i < (urlOrConfigs instanceof Array ? urlOrConfigs.length : 1); i++) {
      data[i] = axios(urlOrConfigs instanceof Array ? urlOrConfigs[i] : urlOrConfigs)
        .then((response) =>
          modeClass.parser(response.data)
        );
    }

    const data_result = <R>(
      await (urlOrConfigs instanceof Array ? Promise.all(data) : data[0])
    );

    if (callback) callback(data_result);
    else return data_result;
  }

  return { request: { staticPage }, express: modeClass.createRouter };
}

export { createScraper, ModeCallback, ModesReturn, ModeObject, Modes, ModeArray };
