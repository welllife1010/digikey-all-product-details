const fetchAllProducts = require("./api.js")
const jsonToCsv = require("./convert-csv.js")
const extractCatIdFromURL = require("./extractCatIdFromUrl.js")
const fetchSpecificManufacturers = require("./getManufacturerId.js")

const urlToScrape =
  "https://www.digikey.com/en/products/filter/embedded/microcontrollers/685"
const catId = extractCatIdFromURL(urlToScrape)
const outputJsonFileBase =
  "./generated-files/product-microcontrollers-0502-part2"
const outputCsvFile =
  "./generated-files/product-microcontrollers-0502-part2.csv"
const keyword = "microcontroller"

// List of manufacturer names you are interested in
const manufacturersOfInterest = [
  "Advanced Micro Devices",
  "Altera",
  "AMD",
  "Analog Devices Inc.",
  "Analog Devices Inc./Maxim Integrated",
  "Fairchild/ON Semiconductor", //Fairchild
  "Fairchild Semiconductor",
  "Infineon Technologies",
  "Intel",
  "Lattice Semiconductor Corporation", //Lattice Semiconductor
  "Linear Technology",
  "Littlefuse",
  "Microchip Technology",
  "Molex",
  "Nexperia USA Inc.",
  "NXP Semiconductors",
  "NXP USA Inc.",
  "Onsemi",
  "Panasonic",
  "Panasonic Electronic Components",
  "Qualcomm",
  "Renesas",
  "Renesas Electronics Corporation",
  "ROHM Semiconductor",
  "Silicon Labs",
  "Skyworks Solutions Inc.", // Skyworks
  "STMicroelectronics",
  "Texas Instruments",
  "Xilinx",
  "Zilog",
]

//const manufacturersOfInterest = ["Renesas Electronics Corporation"]

console.log("Category ID:", catId)

async function getProductDetails() {
  const manufacturers = await fetchSpecificManufacturers(
    manufacturersOfInterest
  )

  // Extract just the Ids into a new array
  const manufacturerIds = manufacturers.map((manufacturer) => {
    console.log(`${manufacturer.Name}: ${manufacturer.Id}`)
    return manufacturer.Id
  })

  // Fetch all products with pagination and token renewal support
  await fetchAllProducts(keyword, catId, manufacturerIds, outputJsonFileBase)

  // Convert JSON to CSV
  await jsonToCsv(outputJsonFileBase, outputCsvFile)
}

getProductDetails()
