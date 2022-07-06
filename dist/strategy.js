"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const axios_1 = require("axios");
const scrape_1 = require("./scrape");
class Strategy {
    constructor(configuration) {
        this.configuration = configuration;
        this.session = new axios_1.Axios({});
        this.configureKeywords();
        this.scraper = new scrape_1.Scrape(configuration.strategy);
    }
    configureKeywords() {
        return (this.configuration.request.params = Object.assign(Object.assign({}, this.configuration.request.params), (this.configuration.keywords && {
            [this.configuration.keywords.queryString]: this.configuration.keywords.value,
        })));
    }
    incrementIndex(index) {
        return (this.configuration.request.params[this.configuration.index.queryString] = !this.configuration.request.params[this.configuration.index.queryString]
            ? this.configuration.index.options.initial +
                (index || 0) * this.configuration.index.options.increment || 0
            : this.configuration.request.params[this.configuration.index.queryString] + this.configuration.index.options.increment);
    }
    /**
     * Request a number of pages, then return an array of scrape result.
     * @param {number} size Represents number of request and increment on index.
     * @param {number | undefined} skip Skip indexes of pages.
     * @return {Promise<Record<keyof T, any[]>[]>} Scrape result objects.
     */
    request(size, skip) {
        const data = [];
        for (let i = 0; i < size; i++) {
            this.incrementIndex(skip);
            data[i] = this.session
                .request(this.configuration.request)
                .then((response) => this.scraper.parse(response.data));
        }
        return Promise.all(data);
    }
}
exports.Strategy = Strategy;
