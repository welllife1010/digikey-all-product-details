// api.js
const fs = require("fs").promises
const axios = require("axios")
require("dotenv").config()
const { getValidToken } = require("./tokenService")

const OFFSET_FILE = "offset.txt"

// Check if file exists
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    console.log(`${filePath} exists`)
    return true
  } catch (error) {
    return error.code !== "ENOENT"
  }
}

// Fetch products with pagination and manufacturer filters
async function fetchProducts(keywords, offset, categoryId, manufacturerIds) {
  try {
    const token = await getValidToken()
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-DIGIKEY-Client-Id": process.env.CLIENT_ID,
      "Content-Type": "application/json",
      "X-DIGIKEY-Locale-Site": "US",
      "X-DIGIKEY-Locale-Language": "en",
      "X-DIGIKEY-Locale-Currency": "USD",
      "X-DIGIKEY-Customer-Id": "0",
    }

    const response = await axios.post(
      process.env.API_BASE_URL,
      {
        Keywords: keywords,
        Limit: 50,
        Offset: offset,
        FilterOptionsRequest: {
          CategoryFilter: [{ Id: categoryId.toString() }],
          ManufacturerFilter: manufacturerIds.map((id) => ({
            Id: id.toString(),
          })),
        },
      },
      { headers }
    )

    return response.data.Products || []
  } catch (error) {
    console.error(`Error fetching products at offset ${offset}:`, error)
    return []
  }
}

// Enhanced fetchAllProducts function with manufacturer filter
async function fetchAllProducts(
  keywords,
  categoryId,
  manufacturers,
  outputFileName
) {
  try {
    let offset = 0
    let allProducts = []

    if (await fileExists(outputFileName)) {
      const existingData = await fs.readFile(outputFileName, "utf8")
      if (existingData.trim().length > 0) {
        allProducts = JSON.parse(existingData)
        console.log("Previous data loaded.")
      }
    }

    if (await fileExists(OFFSET_FILE)) {
      offset = parseInt(await fs.readFile(OFFSET_FILE, "utf8"), 10)
      console.log(`Resuming from offset ${offset}.`)
    }

    while (true) {
      const products = await fetchProducts(
        keywords,
        offset,
        categoryId,
        manufacturers
      )
      console.log("Fetched products count:", products.length)

      if (products.length === 0) {
        console.log("No more products to fetch.")
        break
      }

      allProducts.push(...products)
      offset += products.length
      console.log(`Current offset: ${offset}`)
      await fs.writeFile(OFFSET_FILE, offset.toString(), "utf8")

      if (products.length < 50) {
        console.log("Reached the end of the products list.")
        break
      }
    }

    const formattedData = JSON.stringify(allProducts, null, 2)
    await fs.writeFile(outputFileName, formattedData)
    console.log("All products fetched and saved.")
  } catch (error) {
    console.error("Error during product fetching:", error)
  }
}

module.exports = fetchAllProducts
