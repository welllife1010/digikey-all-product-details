const puppeteerExtra = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
const anonymizeUaPlugin = require("puppeteer-extra-plugin-anonymize-ua")

puppeteerExtra.use(StealthPlugin())
puppeteerExtra.use(anonymizeUaPlugin())

const browserOptions = { headless: false }
const pageOptions = { waitUntil: "networkidle2", timeout: 60000 }

// Function to scrape the element with data-testid attribute
async function scrapeElement(url) {
  // Launch a new browser instance
  const browser = await puppeteerExtra.launch({
    ...browserOptions,
  })

  // Create a new page
  const page = await browser.newPage()

  // Set the viewport to a desktop size
  await page.setViewport({ width: 1366, height: 768 })

  // Navigate to the specified URL
  await page.goto(url, pageOptions)

  try {
    await page.waitForSelector('[data-testid="per-page-selector-container"]', {
      visible: true,
      timeout: 30000,
    })

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

module.exports = scrapeElement
