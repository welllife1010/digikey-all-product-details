const scrapeElementTest = require("./scrape-test.js")
const fetchAllProducts = require("./api.js")
const jsonToCsv = require("./convert-csv.js")

const urlToScrape = "https://www.digikey.com/en/products"
const searchTerm = "Digital Signal Processors"

async function getProductDetails(urlToScrape, searchTerm) {
  try {
    console.log(searchTerm)

    const resultCount = await scrapeElementTest(urlToScrape, searchTerm)

    console.log(resultCount)
    if (resultCount) {
      await fetchAllProducts(searchTerm, resultCount)
      await jsonToCsv()
    } else {
      console.log("Something's wrong")
    }
  } catch (err) {
    return console.log(err.message)
  }
}

getProductDetails(urlToScrape, searchTerm)
