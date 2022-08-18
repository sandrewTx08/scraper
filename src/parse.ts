import { load } from "cheerio";
import express from "express";
import { IModeClass, ModeArray, ModesReturn, ModeCallback, ModeObject } from "./types";

class ModeArrayClass implements IModeClass {
    constructor(public mode: ModeArray) { }

    parser(html: string): ModesReturn<ModeArray> {
        const $page = load(html);
        return this.mode.map((callback) => callback($page));
    }

    createExpress(request: Function, hostname: string) {
        const app = express();

        return app.use((req, res) => {
            const url = hostname + req.url.slice(1);

            try {
                request(url, (result: ModesReturn<ModeArray>) => {
                    res.json(result.map((data) => data.toArray()));
                });
            } catch (error: any) {
                res.json(error.message);
            }
        });
    }
}

class ModeCallbackClass implements IModeClass {
    constructor(private mode: ModeCallback) { }

    parser(html: string): ModesReturn<ModeCallback> {
        const $page = load(html);
        return this.mode($page);
    }

    createExpress(request: Function, hostname: string) {
        const app = express();

        return app.use((req, res) => {
            const url = hostname + req.url.slice(1);

            try {
                request(url, (result: ModesReturn<ModeCallback>) => {
                    res.json(result.toArray())
                });
            } catch (error: any) {
                res.json(error.message);
            }
        });
    }
}
class ModeObjectClass implements IModeClass {
    constructor(private mode: ModeObject) { }

    parser(html: string): ModesReturn<ModeObject> {
        const $page = load(html);
        const object = Object();

        Object.keys(this.mode).forEach((key) => {
            const callback = this.mode[key];
            object[key] = callback($page);
        });

        return object;
    }

    createExpress(request: Function, hostname: string) {
        const app = express();

        return app.use((req, res) => {
            const url = hostname + req.url.slice(1);

            try {
                request(url, (result: ModesReturn<ModeObject>) => {
                    const object = Object();

                    Object.keys(result).forEach((key) => {
                        object[key] = result[key].toArray();
                    });

                    res.json(object);
                });
            } catch (error: any) {
                res.json(error.message);
            }
        });
    }
};

export { ModeArrayClass, ModeCallbackClass, ModeObjectClass }
