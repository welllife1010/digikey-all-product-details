//const puppeteer = require("puppeteer")
const UserAgent = require("user-agents")
const puppeteerExtra = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
const anonymizeUaPlugin = require("puppeteer-extra-plugin-anonymize-ua")

puppeteerExtra.use(StealthPlugin())

// Use the Anonymize UA plugin
puppeteerExtra.use(anonymizeUaPlugin())

const browserOptions = { headless: false }
const pageOptions = { waitUntil: "networkidle2", timeout: 60000 }

// Function to generate a random user agent
// function getRandomUserAgent() {
//   const userAgent = new UserAgent({ deviceCategory: "desktop" })
//   return userAgent.toString()
// }

// Function to scrape the element with data-testid attribute
async function scrapeElementTest(url, term) {
  // Launch a new browser instance
  const browser = await puppeteerExtra.launch({
    ...browserOptions,
    //args: [`--user-agent=${getRandomUserAgent()}`],
  })

  // Create a new page
  const page = await browser.newPage()

  // Set the viewport to a desktop size
  await page.setViewport({ width: 1366, height: 768 })

  // Navigate to the specified URL
  const navigationPromise = page.waitForNavigation({
    waitUntil: "domcontentloaded",
    timeout: 0, // Set to 0 for no timeout
  })

  // Navigate to the specified URL
  await page.goto(url, pageOptions)

  try {
    // Wait for the navigation to complete
    await navigationPromise

    // Scroll through the entire page
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0 // Initializes a variable totalHeight to keep track of the total scrolled height of the page.
        const distance = 100 // Defines the distance to scroll in each step. Here, it's set to 100 pixels.
        const scrollInterval = setInterval(() => {
          // Retrieves the total height of the page content, including the part not currently visible (i.e., the height of the entire document).
          const scrollHeight = document.body.scrollHeight
          // Scrolls the window vertically by the defined distance. In this case, it scrolls downwards by 100 pixels.
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(scrollInterval)
            resolve()
          }
        }, 100)
      })
    })

    await page.waitForSelector('[data-testid="n-lvl-ul-0"]')
    await page.waitForFunction(
      () => {
        const elements = document.querySelectorAll(
          '[data-testid="n-lvl-ul-0"] li ul[data-testid="n-lvl-ul-1"] li a'
        )
        return elements.length > 0
      },
      { timeout: 30000 }
    )

    const text = await page.evaluate((term) => {
      function getKeywords(arr) {
        return arr
          .filter((el) => el.textContent.trim().includes(term))
          .map((element) => element.textContent.trim())
      }

      const arrayOfFirstLayerElements = Array.from(
        document.querySelectorAll('[data-testid="n-lvl-ul-0"] li a')
      )

      const arrayOfSecondLayerElements = Array.from(
        document.querySelectorAll(
          '[data-testid="n-lvl-ul-0"] li ul[data-testid="n-lvl-ul-1"] li a'
        )
      )

      try {
        let textArr = getKeywords(arrayOfFirstLayerElements)

        if (textArr.length > 0 && textArr[0] === term) {
          return textArr
        } else {
          textArr = getKeywords(arrayOfSecondLayerElements)
          return textArr
        }
      } catch (error) {
        console.error("Error:", error.message)
        return []
      }
    }, term)

    function extractAndRemoveCommas(inputString) {
      // Use regular expression to match numbers in the string, including commas
      const numbersArray = inputString.match(/\d{1,3}(,\d{3})*(\.\d+)?/g)

      // If there are matched numbers, remove commas and return them
      if (numbersArray) {
        const numbersWithoutCommas = numbersArray.map((number) =>
          number.replace(/,/g, "")
        )
        return numbersWithoutCommas
      } else {
        return []
      }
    }

    // Check if there is a number before trying to process it
    if (text.length > 0) {
      const numbersWithoutCommas = extractAndRemoveCommas(text[0])
      console.log(numbersWithoutCommas)

      // If you want to parse as float, do it after removing commas
      const parsedFloat = parseFloat(numbersWithoutCommas[0])
      console.log(parsedFloat)
      return parsedFloat
    } else {
      console.log("No text found")
      return null
    }
  } catch (error) {
    console.error("Error:", error.message)
  } finally {
    await browser.close()
  }
}

// Replace 'YOUR_URL_HERE' with the actual URL you want to scrape
// const urlToScrape = "https://www.digikey.com/en/products"
// const searchTerm = "DSP (Digital Signal Processors)"

module.exports = scrapeElementTest
