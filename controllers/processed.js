const path = require('path')
const fs = require('fs')

const { sample, remove } = require('lodash')

const { PROCESSED_IMAGES_DIR } = require('../constants')

const moment = require('moment-timezone')

let lastFile

const getRandom = (_, res) => {
  const day = moment.tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD')

  const todayDir = path.join(PROCESSED_IMAGES_DIR, day)

  if (!fs.existsSync(todayDir)) {
    fs.mkdirSync(todayDir)
  }

  const files = fs.readdirSync(todayDir)

  if (files.length === 0) {
    return res.json({ url: null, timestamp: new Date().getTime() })
  }

  if (files.lenght > 1 && lastFile) {
    remove(files, (f) => f === lastFile)
  }

  const file = sample(files)
  lastFile = file

  res.json({
    url: `/processed/${day}/${file}`,
    timestamp: new Date().getTime(),
  })
}

module.exports = { getRandom }
