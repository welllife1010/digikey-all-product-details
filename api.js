const axios = require("axios")
require("dotenv").config()
const fs = require("fs").promises
const getToken = require("./accessToken")

// Function to fetch all products
async function fetchAllProducts(keywords, resultCount) {
  const searchKeywords = keywords
  const searchLimit = 50
  let allProducts = []

  const token = await getToken()
  console.log("token", token)

  const searchConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-DIGIKEY-Client-Id": process.env.CLIENT_ID,
      "Content-Type": "application/json",
      "X-DIGIKEY-Locale-Site": "US",
      "X-DIGIKEY-Locale-Language": "en",
      "X-DIGIKEY-Locale-Currency": "USD",
      "X-DIGIKEY-Customer-Id": "0",
    },
  }

  for (
    let searchOffset = 0;
    searchOffset < resultCount + 100;
    searchOffset += searchLimit
  ) {
    try {
      let response = await axios.post(
        process.env.API_BASE_URL,
        {
          Keywords: searchKeywords,
          Limit: searchLimit,
          Offset: searchOffset,
        },
        searchConfig
      )

      let currentProducts = response?.data.Products
      allProducts.push(...currentProducts)

      console.log("offset", searchOffset)
    } catch (error) {
      console.error(
        "Error fetching products:",
        error.response
          ? {
              data: error.response.data,
              status: error.response.status,
              headers: error.response.headers,
            }
          : error.message
      )
    }
  }

  // Write the results to a JSON file
  await fs.writeFile(
    "products-work-version.json",
    JSON.stringify(allProducts, null, 2)
  )
  console.log(allProducts.length)
  console.log("All products have been saved to products.json")
}

module.exports = fetchAllProducts
