"use strict"

const axios = require("axios")
const mkdirp = require("mkdirp")
const wget = require("node-wget")
const { getAudioDurationInSeconds } = require("get-audio-duration")

const ytmnd = "pi"
const ytmndUrl = "http://" + ytmnd + ".ytmnd.com"

// get ytmnd
const fetchHtml = async () => {
  return new Promise((resolve, reject) => {
    axios
      .get(ytmndUrl)
      .then(function(response) {
        resolve(response.data)
      })
      .catch(function(error) {
        reject(error)
      })
  })
}

// parse html and return JSON data
// ytmnd.site_data_url = '/info/212062/json';
const getData = async html => {
  return new Promise((resolve, reject) => {
    let res = html.match(/(\/info.*json)/gi)
    let jsonUrl = ytmndUrl + res[0]

    axios
      .get(jsonUrl)
      .then(function(response) {
        resolve(response.data)
      })
      .catch(function(error) {
        reject(error)
      })
  })
}

// download asset
const download = async (url, filename) => {
  return new Promise((resolve, reject) => {
    wget(
      {
        url: url,
        dest: "./sites/" + ytmnd + "/" + filename
      },
      function(error, response, body) {
        if (error) {
          reject(error)
        } else {
          resolve(true)
        }
      }
    )
  })
}

const run = async () => {
  let html = await fetchHtml()
  let data = await getData(html)
  let imageFilename = data.site.foreground.url.replace(/(.*)\./gi, "image.")
  let soundFilename = data.site.sound.url.replace(/(.*)\./gi, "sound.")

  // create folder, do nothing if it already exists
  mkdirp("./sites/" + ytmnd, function(error) {
    console.log(error)
  })

  await download(data.site.foreground.url, imageFilename)
  await download(data.site.sound.url, soundFilename)

  getAudioDurationInSeconds("./sites/" + ytmnd + "/" + soundFilename).then(
    duration => {
      console.log(duration + "seconds")
    }
  )

  return true
}

run()
