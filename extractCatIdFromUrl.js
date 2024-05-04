function extractCatIdFromURL(urlString) {
  const url = new URL(urlString)
  const pathSegments = url.pathname.split("/")
  // Get the last segment which should be a number
  const lastSegment = pathSegments[pathSegments.length - 1]
  return lastSegment
}

module.exports = extractCatIdFromURL
