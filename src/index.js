const dotenv = require("dotenv").config({ path: "./.env.development" });
import { launch } from "puppeteer";
import Airtable, { configure } from "airtable";


configure({ apiKey: process.env.AIRTABLE_API_TOKEN });

(async () => {

  const getProducts = async (page) => {
    return await page.evaluate(() => {
      const results = document.querySelectorAll(".s-item");
      return [...results].slice(1, 6).map((item) => {
        return {
          name: item.querySelector(".s-item__title").innerText,
          price: item.querySelector(".s-item__price").innerText,
          imageSrc: item.querySelector(".s-item__image-wrapper img").src,
          description: item.querySelector(".s-item__subtitle").innerText,
        };
      });
    }, await page.$$(".s-item"));
  };

  const browser = await launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.ebay.com/");
  await page.waitForSelector("#gh-ac");
  await page.type("#gh-ac", "macbook pro m1");

  await Promise.all([
    page.click("#gh-btn"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  const productsData = await getProducts(page);

  const base = new Airtable({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_API_TOKEN,
  }).base(process.env.AIRTABLE_PRODUCTS_BASE_ID);

  base(process.env.AIRTABLE_PRODUCTS_TABLE_ID).create(
    productsData.map((product) => {
      return { fields: { ...product } };
    }),
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach( (record) => {
        console.log(record.getId());
      });
    }
  );
  await browser.close();
})();
