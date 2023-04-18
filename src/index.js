const puppeteer = require("puppeteer");
const Airtable = require("airtable");

(async () => {
  /*const getPrices = async (page) => {

      await page.waitForSelector("span.s-item__price");
    return await page.$$eval("span.s-item__price", (spans) => {
      return [...spans]
        .slice(1)
        .map((span) => span.innerHTML.replace("$", "").replace(",", ""));
    }); 
  };*/

  const getProducts = async (page) => {
    const products = await page.evaluate(() => {
      const results = document.querySelectorAll(".s-item");
      const data = [];
      for (let i = 0; i < results.length; i++) {
        const product = {
          name: results[i].querySelector(".s-item__title").innerText,
          price: results[i].querySelector(".s-item__price").innerText,
          image: results[i].querySelector(".s-item__image-img").src,
          description: results[i].querySelector(".s-item__subtitle").innerText,
        };
        data.push(product);
      }
      return data;
    });

    return products;
  };

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.ebay.com/");
  await page.waitForSelector("#gh-ac");
  await page.type("#gh-ac", "macbook pro m1");
  await page.click("#gh-btn");

  /* console.log(await getPrices(page)); */
  console.log(await getProducts(page));

  await page.click("a.pagination__next");
  /*  console.log(await getPrices(page)); */
  console.log(await getProducts(page));
})();
