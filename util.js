const fs = require('fs')

const { STORAGE_DIR, PROCESSED_IMAGES_DIR, UPLOADS_DIR } = require('./constants')

const initDirs = () => {
  const dirs = [STORAGE_DIR, PROCESSED_IMAGES_DIR, UPLOADS_DIR]

  dirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      return
    }

    fs.mkdirSync(dir)
  })
}

module.exports = { initDirs }
