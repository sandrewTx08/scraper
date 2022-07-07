"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scraper = void 0;
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
class Scraper {
    constructor(configuration) {
        this.configuration = configuration;
        this.session = new axios_1.Axios({});
        this.configureKeywords();
    }
    configureKeywords() {
        return (this.configuration.request.params = Object.assign(Object.assign({}, this.configuration.request.params), (this.configuration.keywords && {
            [this.configuration.keywords.queryString]: this.configuration.keywords.value,
        })));
    }
    incrementIndex(index) {
        return (this.configuration.request.params[this.configuration.index.queryString] = !this.configuration.request.params[this.configuration.index.queryString]
            ? this.configuration.request.params[this.configuration.index.queryString] === 0
                ? (this.configuration.request.params[this.configuration.index.queryString] =
                    this.configuration.request.params[this.configuration.index.queryString] + this.configuration.index.options.increment)
                : this.configuration.index.options.initial +
                    (index || 0) * this.configuration.index.options.increment
            : (this.configuration.request.params[this.configuration.index.queryString] =
                this.configuration.request.params[this.configuration.index.queryString] + this.configuration.index.options.increment));
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
