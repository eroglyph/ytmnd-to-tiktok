"use strict"

const axios = require("axios")
const mkdirp = require("mkdirp")
const wget = require("node-wget")
const ytmnd = "timetraveller"
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

// download media
const download = async (url, filename) => {
  try {
    wget({
      url: url,
      dest: "./sites/" + ytmnd + "/" + filename
    })
  } catch (error) {
    throw error
  }
}

const run = async () => {
  let html = await fetchHtml()
  let data = await getData(html)

  // create folder, do nothing if it already exists
  mkdirp("./sites/" + ytmnd, function(error) {
    console.log(error)
  })

  let imageFilename = data.site.foreground.url.replace(/(.*)\./gi, "image.")

  //console.log(imageFilename)

  let soundFilename = data.site.sound.url.replace(/(.*)\./gi, "sound.")

  console.log(data.site.foreground.url)

  download(data.site.foreground.url, imageFilename)
  download(data.site.sound.url, soundFilename)

  return true
}

run()
