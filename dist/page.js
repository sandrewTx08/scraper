"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
class Page {
    constructor(configuration) {
        this.configuration = configuration;
        this._index = 0;
        this.configuration.request.params = Object.assign(Object.assign({}, configuration.request.params), (configuration.keywords && {
            [configuration.keywords.queryString]: configuration.keywords.value,
        }));
    }
    set index(index) {
        this._index = index;
    }
    get index() {
        return this._index;
    }
    set queryStringIndex(index) {
        this.configuration.request.params[this.configuration.index.queryString] =
            index;
    }
    get queryStringIndex() {
        return this.configuration.request.params[this.configuration.index.queryString];
    }
    increment(callback) {
        this.initial();
        callback();
        this.constant();
        this.index++;
        return this.index;
    }
    initial() {
        if (!this.queryStringIndex)
            this.queryStringIndex = this.configuration.index.options.initial || 0;
        return this.queryStringIndex;
    }
    constant() {
        if (this.configuration.index.options.increment)
            this.queryStringIndex =
                this.queryStringIndex + this.configuration.index.options.increment;
        return this.queryStringIndex;
    }
}
exports.Page = Page;
