const scrapeElement = require("./scrape.js")
const fetchAllProducts = require("./api.js")
const jsonToCsv = require("./convert-csv.js")

// Replace 'YOUR_URL_HERE' with the actual URL you want to scrape
let urlToScrape =
  "https://www.digikey.com/en/products/filter/temperature-sensors/ntc-thermistors/508"

const removeLastSlashContentFromUrl = urlToScrape.substring(
  0,
  urlToScrape.lastIndexOf("/")
)
const getNewLastSlashContentFromUrl = removeLastSlashContentFromUrl.substring(
  removeLastSlashContentFromUrl.lastIndexOf("/") + 1
)

const extractedKeywords = getNewLastSlashContentFromUrl.replace(
  /[^A-Za-z0-9]/g,
  " "
)

console.log("removeLastSlashContentFromUrl", removeLastSlashContentFromUrl)
console.log("getNewLastSlashContentFromUrl", getNewLastSlashContentFromUrl)
console.log("extractedKeywords", extractedKeywords)

// const urlToScrape =
//   "https://www.digikey.com/en/products/filter/controllers-accessories/816"

// const keywords = "Controller Accessories"

async function getProductDetails() {
  // Call the function with the specified URL
  const resaultCount = await scrapeElement(urlToScrape)

  if (resaultCount) {
    await fetchAllProducts(extractedKeywords, resaultCount)
    await jsonToCsv()
  }
}

getProductDetails()
