const scrapeElementTest = require("./scrape-test.js")
const fetchAllProducts = require("./api.js")
const jsonToCsv = require("./convert-csv.js")
require("dotenv").config()

const urlToScrape = process.env.SEARCH_URL
const searchTerm = "Digital Signal Processors"

async function getProductDetails(urlToScrape, searchTerm) {
  try {
    const resultCount = await scrapeElementTest(urlToScrape, searchTerm)

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
