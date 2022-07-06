import { CheerioAPI, load } from "cheerio";

export type ScrapeCallback<D, T = any> = {
  [key in keyof D]: <Push extends Array<T>["push"]>(
    $: CheerioAPI,
    push: Push
  ) => void;
};

export interface IScrape<T> {
  strategy: ScrapeCallback<T>;
  parse: (arg: string) => T;
}

export class Scrape<T> implements IScrape<T> {
  constructor(readonly strategy: ScrapeCallback<T>) {}

  parse(html: string) {
    type StrategyKeys = keyof ScrapeCallback<T>;
    type StrategyObject = { [key in StrategyKeys]: any };

    const $page = load(html);
    const result: StrategyObject = Object();

    Object.keys(this.strategy).map((key) => {
      const data: T[] = [];
      const callback = this.strategy[<StrategyKeys>key];
      callback($page, (arg: T) => data.push(arg));
      result[<StrategyKeys>key] = data;
    });
    return result;
  }
}
