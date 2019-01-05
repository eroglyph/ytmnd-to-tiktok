"use strict"

const axios = require("axios")
const mkdirp = require("mkdirp")
const wget = require("node-wget")
const cmd = require("node-cmd")
const path = require("path")

const { getAudioDurationInSeconds } = require("get-audio-duration")
const commandLineArgs = require("command-line-args")

const optionDefinitions = [
  { name: "ytmnd", type: String, multiple: false, defaultOption: true },
  { name: "length", type: String, multiple: false, defaultOption: false }
]

const options = commandLineArgs(optionDefinitions)

console.log(options)

const ytmnd = options.ytmnd
const ytmndUrl = "http://" + ytmnd + ".ytmnd.com"
const ytmndPath = "./sites/" + ytmnd + "/"
let ytmndInfo = {}

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

    console.log(jsonUrl)

    download(jsonUrl, "info.json") // archive this

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
        dest: ytmndPath + filename
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

// get audio file duration
const getDuration = async filename => {
  return new Promise((resolve, reject) => {
    try {
      getAudioDurationInSeconds(ytmndPath + filename).then(duration => {
        resolve(duration)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// render video to post
const createTikTok = async (imageFilename, soundFilename) => {
  return new Promise(async (resolve, reject) => {
    try {
      let commands = []
      let length = await getDuration(soundFilename)

      if (length < 5) {
        length = Math.round(length * 3)
      } else {
        length = Math.round(length)
      }

      console.log("Length: " + length)

      // render audio
      commands.push(`sox sites/${ytmnd}/${soundFilename} sites/${ytmnd}/sound_looped.mp3 repeat 20 && ffmpeg -ss 0 -t 60 -i sites/${ytmnd}/sound_looped.mp3 sites/${ytmnd}/sound_final.mp3`)

      // resize and stack image
      commands.push(`convert sites/${ytmnd}/${imageFilename} -resize 375x375 sites/${ytmnd}/resized_${imageFilename}`)

      commands.push(`ffmpeg -i sites/${ytmnd}/resized_${imageFilename} -i sites/${ytmnd}/resized_${imageFilename} -i sites/${ytmnd}/resized_${imageFilename} -filter_complex vstack=inputs=3 sites/${ytmnd}/stacked_${imageFilename}`)

      // composite image and video
      if(path.extname(imageFilename) == ".gif") {
        commands.push(`ffmpeg -i assets/bg.mp4 -ignore_loop 0 -i sites/${ytmnd}/stacked_${imageFilename} -filter_complex "[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,0,60):shortest=1" -pix_fmt yuv420p -c:a copy sites/${ytmnd}/video.mp4`)
      } else {
        commands.push(`ffmpeg -i assets/bg.mp4 -i sites/${ytmnd}/stacked_${imageFilename} -filter_complex "[0:v][1:v] overlay=0:0" -pix_fmt yuv420p -c:a copy sites/${ytmnd}/video.mp4`)
      }

      // render video with sound
      commands.push(`ffmpeg -i sites/${ytmnd}/video.mp4 -i sites/${ytmnd}/sound_final.mp3 -filter_complex "[1:0] adelay=0|0 [delayed];[0:1][delayed] amix=inputs=2" -map 0:0 -c:a aac -strict -2 -c:v copy sites/${ytmnd}/video_wsound.mp4`)

      // crop video to specified length
      commands.push(`ffmpeg -ss 00:00:00 -i sites/${ytmnd}/video_wsound.mp4 -to 00:00:${length} -c copy sites/${ytmnd}/tiktok.mp4`)

      // cleanup
      // let cleanUp = `rm *_*`

      console.log(commands)

      resolve(commands.join(" && "))
    } catch (error) {
      reject(error)
    }
  })
}

const run = async () => {
  await cmd.run(`rm -rf sites/${ytmnd} && mkdir sites/${ytmnd}`)

  let html = await fetchHtml()
  ytmndInfo = await getData(html) // global json data from site
  let imageFilename = ytmndInfo.site.foreground.url.replace(
    /(.*)\./gi,
    "image."
  )
  let soundFilename = ytmndInfo.site.sound.url.replace(/(.*)\./gi, "sound.")

  await download(ytmndInfo.site.foreground.url, imageFilename)
  await download(ytmndInfo.site.sound.url, soundFilename)

  //  ytmndInfo.duration = await getDuration(soundFilename)
  let command = await createTikTok(imageFilename, soundFilename)

  await cmd.run(command)

  return true
}

run()
