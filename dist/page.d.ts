import { ScrapeConfiguration } from "./strategy";
export interface IPage<T> {
    get index(): number;
    set index(arg: number);
    configuration: ScrapeConfiguration<T>;
}
export declare class Page<T> implements IPage<T> {
    configuration: ScrapeConfiguration<T>;
    private _index;
    constructor(configuration: ScrapeConfiguration<T>);
    set index(index: number);
    get index(): number;
    private set queryStringIndex(value);
    private get queryStringIndex();
    increment(callback: Function): number;
    private initial;
    private constant;
}
