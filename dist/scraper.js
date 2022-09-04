"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const express_1 = require("express");
const url_1 = require("url");
function createScraper(mode) {
    function parser(html) {
        const $page = (0, cheerio_1.load)(html);
        return mode instanceof Function
            ? mode($page)
            : mode instanceof Array
                ? mode.map((callback) => callback($page))
                : mode instanceof Object
                    ? (() => {
                        const object = Object();
                        for (const key of Object.keys(mode))
                            object[key] = mode[key]($page);
                        return object;
                    })()
                    : TypeError("Invalid type mode.");
    }
    function express(options) {
        const url_parse = (0, url_1.parse)(options.hostname);
        return (0, express_1.Router)().get(url_parse.pathname, (req, res, next) => {
            let hostname_url = options.hostname;
            for (const key of Object.keys(req.params)) {
                hostname_url = options.hostname.replace(":" + key, req.params[key]);
            }
            for (const key of Object.keys(req.query)) {
                const url = new url_1.URL(hostname_url);
                url.searchParams.append(key, req.query[key]);
                hostname_url = url.toString();
            }
            options
                .request(hostname_url)
                .then((result) => {
                res.json(result instanceof Array
                    ? result.map((callback) => callback.toArray())
                    : "toArray" in result
                        ? result.toArray()
                        : result instanceof Object
                            ? (() => {
                                const object = Object();
                                for (const key of Object.keys(result))
                                    object[key] = result[key].toArray();
                                return object;
                            })()
                            : TypeError("Error sending data."));
            })
                .catch(next);
        });
    }
    function staticPage(urlOrConfigs, callback) {
        const data = [];
        for (let i = 0; i < (urlOrConfigs instanceof Array ? urlOrConfigs.length : 1); i++) {
            data[i] = (0, axios_1.default)(urlOrConfigs instanceof Array ? urlOrConfigs[i] : urlOrConfigs).then((response) => parser(response.data));
        }
        const result = ((urlOrConfigs instanceof Array ? Promise.all(data) : data[0]));
        if (callback)
            result.then(callback);
        else
            return result;
    }
    return { request: { staticPage }, express };
}
exports.createScraper = createScraper;
