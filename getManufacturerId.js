const axios = require("axios")
require("dotenv").config()
const { getValidToken } = require("./tokenService")

const fs = require("fs")
const path = "./manufacturer_log.txt"

async function fetchSpecificManufacturers(manufacturerNames) {
  try {
    const token = await getValidToken()
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-DIGIKEY-Client-Id": process.env.CLIENT_ID,
      "Content-Type": "application/json",
    }

    const response = await axios.get(process.env.API_MFR_URL, { headers })
    const manufacturers = response.data.Manufacturers || []

    // Convert manufacturerNames to lowercase for case-insensitive comparison
    const lowercaseNames = manufacturerNames.map((name) => name.toLowerCase())

    // const logManufacturersToFile = (manufacturers) => {
    //   const data = manufacturers
    //     .map((manufacturer) => `${manufacturer.Name}: ${manufacturer.Id}`)
    //     .join("\n")
    //   try {
    //     fs.writeFileSync(path, data)
    //     console.log(`Data successfully written to ${path}`)
    //   } catch (error) {
    //     console.error("Failed to write to file:", error)
    //   }
    // }

    // logManufacturersToFile(manufacturers) // Call this function where 'manufacturers' is your array of manufacturer objects

    // Filter for specific manufacturers by exact name match, considering case insensitivity
    const filteredManufacturers = manufacturers.filter((manufacturer) =>
      lowercaseNames.some(
        (name) => name === manufacturer.Name.toLowerCase().trim()
      )
    )

    console.log(
      "Filtered Manufacturers:",
      filteredManufacturers.map((m) => `${m.Name}: ${m.Id}`)
    )

    return filteredManufacturers
  } catch (error) {
    console.error("Error fetching specific manufacturers:", error)
    return []
  }
}

module.exports = fetchSpecificManufacturers
