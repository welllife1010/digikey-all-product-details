const puppeteer = require("puppeteer")
const UserAgent = require("user-agents")

const browserOptions = { headless: false }
const pageOptions = { waitUntil: "networkidle2", timeout: 60000 }

// Function to generate a random user agent
function getRandomUserAgent() {
  const userAgent = new UserAgent()
  return userAgent.toString()
}

// Function to scrape the element with data-testid attribute
async function scrapeElement(url) {
  // Launch a new browser instance
  //const browser = await puppeteer.launch(browserOptions)
  const browser = await puppeteer.launch({
    ...browserOptions,
    args: [`--user-agent=${getRandomUserAgent()}`],
  })

  // Create a new page
  const page = await browser.newPage()

  // Set the viewport to a desktop size
  await page.setViewport({ width: 1366, height: 768 })

  // Navigate to the specified URL
  await page.goto(url, pageOptions)

  try {
    console.log("Before waiting for selector")
    await page.waitForSelector('[data-testid="per-page-selector-container"]', {
      visible: true,
      timeout: 30000,
    })
    console.log("After waiting for selector")

    const elementContent = await page.$eval(
      '[data-testid="per-page-selector-container"]',
      (element) => element.textContent
    )

    const resultNumbers = elementContent.substring(
      elementContent.lastIndexOf("/") + 1,
      elementContent.length
    )

    const scrappedNumber = parseFloat(
      resultNumbers.slice(-6).replace(",", "").replace(" ", "")
    )

    console.log("Result Numbers:", resultNumbers)
    console.log("Element Content:", scrappedNumber)

    return scrappedNumber
  } catch (error) {
    console.error("Error:", error.message)
  } finally {
    // Close the browser
    await browser.close()
  }
}

// Replace 'YOUR_URL_HERE' with the actual URL you want to scrape
//const urlToScrape =("https://www.digikey.com/en/products/filter/embedded/dsp-digital-signal-processors/698")

// Call the function with the specified URL
//scrapeElement(urlToScrape)

module.exports = scrapeElement
