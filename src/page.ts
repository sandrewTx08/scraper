import { ScrapeConfiguration } from "./strategy";

export interface IPage<T> {
  get index(): number;
  set index(arg: number);
  configuration: ScrapeConfiguration<T>;
}

export class Page<T> implements IPage<T> {
  private _index: number = 0;

  constructor(public configuration: ScrapeConfiguration<T>) {
    this.configuration.request.params = {
      ...configuration.request.params,
      ...(configuration.keywords && {
        [configuration.keywords.queryString]: configuration.keywords.value,
      }),
    };
  }

  set index(index: number) {
    this._index = index;
  }

  get index() {
    return this._index;
  }

  private set queryStringIndex(index: number) {
    this.configuration.request.params[this.configuration.index.queryString] =
      index;
  }

  private get queryStringIndex() {
    return this.configuration.request.params[
      this.configuration.index.queryString
    ];
  }

  increment(callback: Function) {
    this.initial();
    callback();
    this.constant();
    this.index++;
    return this.index;
  }

  private initial() {
    if (!this.queryStringIndex)
      this.queryStringIndex = this.configuration.index.options.initial || 0;
    return this.queryStringIndex;
  }

  private constant() {
    if (this.configuration.index.options.increment)
      this.queryStringIndex =
        this.queryStringIndex + this.configuration.index.options.increment;
    return this.queryStringIndex;
  }
}
