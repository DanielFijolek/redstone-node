const fs = require("fs");
const _ = require("lodash");

const OUTPUT_FILE_PATH = "./manifests/all-supported-tokens.json";

const manifestsToExclude = [
  "5-top-tokens.json",
  "all-supported-tokens.json",
  "api-dojo-rapid.json",
  "rapid.json",
  "stocks.json"
];

main();

function main() {
  const manifests = readManifests();

  // Building tokens
  const tokens = {};
  for (const sourceManifest of manifests) {
    const sourceId = sourceManifest.defaultSource[0];

    for (const tokenName in sourceManifest.tokens) {
      if (tokens[tokenName] !== undefined) {
        tokens[tokenName].source.push(sourceId);
      } else {
        tokens[tokenName] = {
          source: [sourceId],
        };
      }
    }
  }

  // Sort tokens by number of sources
  const tokensWithSortedKeys = {};
  const sortedKeys = _.keys(tokens).sort((token1, token2) => {
    return tokens[token2].source.length - tokens[token1].source.length;
  });
  for (const symbol of sortedKeys) {
    tokensWithSortedKeys[symbol] = tokens[symbol];
  }

  const manifest = {
    interval: 60000,
    priceAggregator: "median",
    sourceTimeout: 50000,
    maxPriceDeviationPercent: 25,
    evmChainId: 1,
    tokens: tokensWithSortedKeys,
  };

  console.log(`Saving manifest to: ${OUTPUT_FILE_PATH}`);
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

function readManifests() {
  const manifestsDir = "./manifests/";
  const configs = [];
  const files = fs.readdirSync(manifestsDir);
  for (const fileName of files) {
    if (!manifestsToExclude.includes(fileName)) {
      const fileData = fs.readFileSync(manifestsDir + fileName, "utf8");
      configs.push(JSON.parse(fileData));
    }
  }
  return configs;
}