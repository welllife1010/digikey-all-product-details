const axios = require("axios")
require("dotenv").config()

// Function to get the access token
async function getToken() {
  try {
    const tokenData = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
    }

    const tokenConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Host: "api.digikey.com",
      },
    }

    const tokenResponse = await axios.post(
      process.env.API_TOKEN_URL,
      tokenData,
      tokenConfig
    )
    //console.log("tokenResponse.data", tokenResponse.data)

    return tokenResponse.data.access_token
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.tokenResponse
        ? {
            data: error.tokenResponse.data,
            status: error.tokenResponse.status,
            headers: error.tokenResponse.headers,
          }
        : error.message
    )

    return error.message
  }
}

module.exports = getToken
