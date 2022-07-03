"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const axios_1 = require("axios");
const scrape_1 = require("./scrape");
const page_1 = require("./page");
class Strategy {
    constructor(configuration) {
        this.session = new axios_1.Axios({});
        this.page = new page_1.Page(configuration);
        this.scraper = new scrape_1.Scrape(configuration.strategy);
    }
    /**
     * Request a number of pages, then return an array of scrape result.
     * @param {number} size Represents number of request and increment on index.
     * @return {Promise<Record<keyof T, any[]>[]>} Scrape result objects.
     */
    request(size) {
        const data = [];
        for (let i = 0; i < size; i++)
            this.page.increment(() => {
                data[this.page.index] = this.session
                    .request(this.page.configuration.request)
                    .then((response) => this.scraper.parse(response.data));
            });
        return Promise.all(data);
    }
}
exports.Strategy = Strategy;
