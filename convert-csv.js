const fs = require("fs")
const jsonexport = require("jsonexport")

async function jsonToCsv(jsonFileBase, csvFileBase) {
  let index = 0

  // Function to save a CSV chunk
  const saveCsvChunk = (chunk, partIndex) => {
    const options = { fillGaps: true }
    jsonexport(chunk, options, (err, csv) => {
      if (err) {
        console.error("Error converting JSON to CSV:", err)
        return
      }
      const partFileName = `${
        csvFileBase.split(".csv")[0]
      }_part${partIndex}.csv`
      fs.writeFile(partFileName, csv, (err) => {
        if (err) {
          console.error("Error writing the CSV file:", err)
          return
        }
        console.log(`Successfully saved as ${partFileName}`)
      })
    })
  }

  // Define the size of each chunk (e.g., 5000 records per file)
  const chunkSize = 5000
  let partIndex = 1

  // Read all JSON files with index suffixes
  while (true) {
    const jsonFileName = `${jsonFileBase}_${index}.json`
    if (!fs.existsSync(jsonFileName)) break

    const data = fs.readFileSync(jsonFileName, "utf-8")
    const products = JSON.parse(data)

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize)
      saveCsvChunk(chunk, partIndex)
      partIndex++
    }

    index++
  }
}

module.exports = jsonToCsv
