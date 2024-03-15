const fs = require("fs")
const jsonexport = require("jsonexport")

async function jsonToCsv() {
  // Read the JSON file
  fs.readFile("products-work-version.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading the JSON file:", err)
      return
    }

    // Parse the JSON data
    const products = JSON.parse(data)

    // Convert to CSV
    const options = {
      fillGaps: true,
    }

    jsonexport(products, options, (err, csv) => {
      if (err) {
        console.error("Error converting JSON to CSV:", err)
        return
      }

      // Write the CSV data to a file
      fs.writeFile("products-work-version.csv", csv, (err) => {
        if (err) {
          console.error("Error writing the CSV file:", err)
          return
        }
        console.log(
          "Successfully converted JSON to CSV and saved as products.csv"
        )
      })
    })
  })
}

module.exports = jsonToCsv
