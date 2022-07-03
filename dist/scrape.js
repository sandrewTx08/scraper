"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrape = void 0;
const cheerio_1 = require("cheerio");
class Scrape {
    constructor(strategy) {
        this.strategy = strategy;
    }
    parse(html) {
        const $page = (0, cheerio_1.load)(html);
        const result = Object();
        Object.keys(this.strategy).map((key) => {
            const data = [];
            const callback = this.strategy[key];
            callback($page, (arg) => data.push(arg));
            result[key] = data;
        });
        return result;
    }
}
exports.Scrape = Scrape;
