const fs = require("fs").promises
const path = require("path")
const axios = require("axios")
require("dotenv").config()
const { getValidToken } = require("./tokenService")

const OFFSET_FILE = "offset.txt"
const FILE_SIZE_LIMIT = 100 * 1024 * 1024 // 100 MB file size limit

// Check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch (error) {
    return false
  }
}

// Ensure the directory exists
async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.mkdir(directoryPath, { recursive: true })
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error
    }
  }
}

// Write data to file
async function writeToFile(filePath, data) {
  try {
    // Ensure the directory exists
    const directoryPath = path.dirname(filePath)
    await ensureDirectoryExists(directoryPath)

    // Write data to the file
    await fs.writeFile(filePath, data, "utf8")
    console.log(`Data saved to file: ${filePath}`)
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`)
  }
}

// Get the next file index based on existing files
async function getNextFileIndex(outputFileBaseName) {
  let fileIndex = 0
  while (await fileExists(`${outputFileBaseName}_${fileIndex}.json`)) {
    fileIndex++
  }
  return fileIndex
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

// Enhanced fetchAllProducts function with file splitting and interruption handling
async function fetchAllProducts(
  keywords,
  categoryId,
  manufacturers,
  outputFileBaseName
) {
  let offset = 0
  let fileIndex = await getNextFileIndex(outputFileBaseName)
  let fileSize = 0
  let allProducts = []

  if (await fileExists(OFFSET_FILE)) {
    offset = parseInt(await fs.readFile(OFFSET_FILE, "utf8"), 10)
    console.log(`Resuming from offset ${offset}.`)
  }

  const saveDataToFile = async () => {
    const outputFileName = `${outputFileBaseName}_${fileIndex}.json`
    await writeToFile(outputFileName, JSON.stringify(allProducts, null, 2))
    fileIndex++
    allProducts = []
    fileSize = 0
  }

  try {
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

      const formattedData = JSON.stringify(allProducts, null, 2)
      fileSize = Buffer.byteLength(formattedData, "utf8")

      if (fileSize >= FILE_SIZE_LIMIT) {
        await saveDataToFile()
      }
    }

    if (allProducts.length > 0) {
      await saveDataToFile()
    }

    console.log("All products fetched and saved.")
  } catch (error) {
    console.error("Error during product fetching:", error)
    if (allProducts.length > 0) {
      await saveDataToFile()
    }
  }
}

module.exports = fetchAllProducts
