"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scraper = void 0;
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
class Scraper {
    constructor(configuration) {
        this.configuration = configuration;
        this.session = new axios_1.Axios({});
        this.configuration.request.params = Object.assign({}, this.configureKeywords());
    }
    configureKeywords() {
        return this.configuration.keywords
            ? {
                [this.configuration.keywords.queryString]: this.configuration.keywords.value,
            }
            : null;
    }
    incrementIndex(index) {
        return (this.index = !this.index
            ? this.index === 0
                ? this.index + this.configuration.index.options.increment
                : this.configuration.index.options.initial +
                    (index || 0) * this.configuration.index.options.increment
            : this.index + this.configuration.index.options.increment);
    }
    get index() {
        return this.configuration.request.params[this.configuration.index.queryString];
    }
    set index(index) {
        this.configuration.request.params[this.configuration.index.queryString] =
            index;
    }
    parse(html) {
        const $page = (0, cheerio_1.load)(html);
        const object = Object();
        Object.keys(this.configuration.strategy).map((key) => {
            const data = [];
            const callback = this.configuration.strategy[key];
            callback($page, (arg) => data.push(arg));
            object[key] = data;
        });
        return object;
    }
    /**
     * Request a number of pages, then return an array of scrape result.
     * @param {number} size Represents number of request and increment on index.
     * @param {number | undefined} skip Skip indexes of pages.
     * @return {Promise<D[]>} Scrape result objects.
     */
    request(size, skip) {
        const data = [];
        for (let i = 0; i < size; i++) {
            this.incrementIndex(skip);
            data[i] = this.session
                .request(this.configuration.request)
                .then((response) => this.parse(response.data));
        }
        return Promise.all(data);
    }
}
exports.Scraper = Scraper;
