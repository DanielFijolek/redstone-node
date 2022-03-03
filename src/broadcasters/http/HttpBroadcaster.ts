import axios from "axios";
import mode from "../../../mode";
import { Broadcaster } from "../Broadcaster";
import { PriceDataSigned, SignedPricePackage } from "../../types";
import { Consola } from "consola";

const logger = require("../../utils/logger")("HttpBroadcaster") as Consola;

// TODO: add timeout to broadcasting

export class HttpBroadcaster implements Broadcaster {
  constructor(private readonly broadcasterURLs: string[] = [mode.broadcasterUrl]) {}

  async broadcast(prices: PriceDataSigned[]): Promise<void> {
    const promises = this.broadcasterURLs.map(url => {
      logger.info(`Posting prices to ${url}`);
      return axios.post(url + '/prices', prices)
        .then(() => logger.info(`Broadcasting to ${url} completed`))
        .catch(e => logger.error(`Broadcasting to ${url} failed: ${e.toString()}`));
    });

    await Promise.allSettled(promises);
  }

  async broadcastPricePackage(
    signedData: SignedPricePackage,
    providerAddress: string): Promise<void> {
      const body = {
        signature: signedData.signature,
        liteSignature: signedData.liteSignature,
        signer: signedData.signer,
        provider: providerAddress,
        ...signedData.pricePackage, // unpacking prices and timestamp
      };

      const promises = this.broadcasterURLs.map(url => {
        logger.info(`Posting pacakages to ${url}`);
        return axios.post(url + '/packages', body)
          .then(() => logger.info(`Broadcasting package to ${url} completed`))
          .catch(e => logger.error(`Broadcasting package to ${url} failed: ${e.toString()}`));
      });

      await Promise.allSettled(promises);
    }
}
