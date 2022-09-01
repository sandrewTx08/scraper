import { load } from "cheerio";
import { Router } from "express";
import { parse, URL } from "url";
import {
  IModeClass,
  ModeArray,
  ModesReturn,
  ModeCallback,
  ModeObject,
} from "./types";

class ModeArrayClass implements IModeClass<ModeArray> {
  constructor(private mode: ModeArray) {}

  parser(html: string): ModesReturn<ModeArray> {
    const $page = load(html);
    return this.mode.map((callback) => callback($page));
  }

  createRouter(request: Function, hostname: string) {
    const url_parse = parse(hostname);

    return Router().get(url_parse.pathname!, (req, res) => {
      for (const key of Object.keys(req.params)) {
        hostname = hostname.replace(":" + key, req.params[key]);
      }

      for (const key of Object.keys(req.query)) {
        const url = new URL(hostname);
        url.searchParams.append(key, req.query[key] as string);
        hostname = url.toString();
      }

      try {
        request(hostname, (result: ModesReturn<ModeArray>) => {
          res.json(result.map((data) => data.toArray()));
        });
      } catch (error: any) {
        res.json(error.message);
      }
    });
  }
}

class ModeCallbackClass implements IModeClass<ModeCallback> {
  constructor(private mode: ModeCallback) {}

  parser(html: string): ModesReturn<ModeCallback> {
    const $page = load(html);
    return this.mode($page);
  }

  createRouter(request: Function, hostname: string) {
    const url_parse = parse(hostname);

    return Router().get(url_parse.pathname!, (req, res) => {
      for (const key of Object.keys(req.params)) {
        hostname = hostname.replace(":" + key, req.params[key]);
      }

      for (const key of Object.keys(req.query)) {
        const url = new URL(hostname);
        url.searchParams.append(key, req.query[key] as string);
        hostname = url.toString();
      }

      try {
        request(hostname, (result: ModesReturn<ModeCallback>) => {
          res.json(result.toArray());
        });
      } catch (error: any) {
        res.json(error.message);
      }
    });
  }
}

class ModeObjectClass implements IModeClass<ModeObject> {
  constructor(private mode: ModeObject) {}

  parser(html: string): ModesReturn<ModeObject> {
    const $page = load(html);
    const object = Object();

    Object.keys(this.mode).forEach((key) => {
      const callback = this.mode[key];
      object[key] = callback($page);
    });

    return object;
  }

  createRouter(request: Function, hostname: string) {
    const url_parse = parse(hostname);

    return Router().get(url_parse.pathname!, (req, res) => {
      for (const key of Object.keys(req.params)) {
        hostname = hostname.replace(":" + key, req.params[key]);
      }

      for (const key of Object.keys(req.query)) {
        const url = new URL(hostname);
        url.searchParams.append(key, req.query[key] as string);
        hostname = url.toString();
      }

      try {
        request(hostname, (result: ModesReturn<ModeObject>) => {
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
}

export { ModeArrayClass, ModeCallbackClass, ModeObjectClass };
