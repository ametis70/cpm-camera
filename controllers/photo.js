const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')

const { PROCESSED_IMAGES_DIR, UPLOADS_DIR, PROCESS_BIN } = require('../constants')

const { getVisitorsInfo } = require('../db')

const uploadPhoto = (req, res) => {
  try {
    if (!req.file) {
      return res.send({
        status: false,
        message: 'No file uploaded',
      })
    }

    getVisitorsInfo(async (err, row) => {
      if (err) {
        res.send(500)
        throw err
      }

      const { city, school, age, fileNumber } = row
      const photo = req.file

      const segments = photo.originalname.split('.')
      const extension = segments[segments.legnth - 1]
      const filepath = `${photo.path}.${extension}`
      fs.renameSync(photo.path, filepath)

      const python = spawnSync(PROCESS_BIN, [
        filepath,
        city,
        school,
        age,
        fileNumber,
        PROCESSED_IMAGES_DIR,
      ])

      console.log('stdout: ', python.stdout.toString('utf8'))
      console.log('stderr: ', python.stderr.toString('utf8'))

      if (python.status === 0) {
        res.send({
          status: true,
          message: 'Photo uploaded and processed succesfully',
        })
      } else {
        res.status(500).send()
      }
    })
  } catch (err) {
    res.status(500).send(err)
    throw err
  }
}

module.exports = { uploadPhoto }
