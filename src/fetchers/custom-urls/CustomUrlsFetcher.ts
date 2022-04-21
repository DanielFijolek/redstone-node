import axios from "axios";
import _ from "lodash";
import jp from "jsonpath";
import { FetcherOpts, PricesObj } from "../../types";
import { BaseFetcher } from "../BaseFetcher";

// TODO: improve this implementation
// It's just a PoC now

export class CustomUrlsFetcher extends BaseFetcher {
  constructor() {
    super(`custom-urls`);
  }

  async fetchData(ids: string[], opts: FetcherOpts) {
    const responses: any = {};
    const promises = [];

    for (const id of ids) {
      // TODO: implement hash verification later

      const url = opts.manifest.tokens[id].customUrlsDetails!.url;

      // TODO implement timeout for each url
      const promise = axios.get(url).then(response => {
        responses[id] = response.data;
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);

    return responses;
  }

  async extractPrices(responses: any, _ids: string[], opts: FetcherOpts): Promise<PricesObj> {
    const pricesObj: PricesObj = {};
    for (const [id, response] of Object.entries(responses)) {
      const jsonpath = opts.manifest.tokens[id].customUrlsDetails!.jsonpath;
      // TODO: remove
      console.log({jsonpath});
      process.exit();
      const extractedValue = jp.query(response, jsonpath);
      pricesObj[id] = extractedValue[0];
    }
    return pricesObj;
  }
};
