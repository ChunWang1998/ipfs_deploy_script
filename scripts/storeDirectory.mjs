import { NFTStorage } from "nft.storage";
import fs from "fs";
import util from "util";
import {
  API_KEY,
  ASSETSFOLDERPATH,
  NFT_NAME,
  NFT_DESCRIPTION,
} from "../constant.mjs";

async function getAssetsNum() {
  const readDirAsync = util.promisify(fs.readdir);
  const files = await readDirAsync(ASSETSFOLDERPATH);
  const imageFiles = files.filter((file) => {
    const fileExtension = file.split(".").pop().toLowerCase();
    return ["jpg", "png"].includes(fileExtension);
  });
  const imageCount = imageFiles.length;
  console.log(`Image count: ${imageCount}`);
  return imageCount;
}

async function createJsonFileInJsonsFolder(num, cid) {
  let baseUri = "ipfs://" + cid;
  for (let i = 0; i < num; i++) {
    let tempMetadata = {
      name: NFT_NAME,
      description: NFT_DESCRIPTION,
      image: `${baseUri}/${i}.png`,
      // attributes: attributes,
    };
    fs.writeFileSync(`jsons/${i}.json`, JSON.stringify(tempMetadata, null, 2));
  }
}

async function deployAssetsToIPFS(num) {
  let files = [];
  for (let i = 0; i < num; i++) {
    files.push(
      new File([await fs.promises.readFile(`assets/${i}.png`)], `${i}.png`, {
        type: "image/png",
      })
    );
  }

  const storage = new NFTStorage({ token: API_KEY });

  return await storage.storeDirectory(files);
}

async function deployJSONsToIPFS(num) {
  let files = [];
  for (let i = 0; i < num; i++) {
    files.push(
      new File([await fs.promises.readFile(`jsons/${i}.json`)], `${i}.json`)
    );
  }

  const storage = new NFTStorage({ token: API_KEY });

  return await storage.storeDirectory(files);
}

async function main() {
  let num = await getAssetsNum();

  let cidAssets = await deployAssetsToIPFS(num);
  console.log("Assets base CID: " + cidAssets);

  await createJsonFileInJsonsFolder(num, cidAssets);

  let cidJSONs = await deployJSONsToIPFS(num);
  console.log("JSONs base CID: " + cidJSONs);
}
main();
