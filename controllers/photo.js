const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')

const { PROCESSED_IMAGES_DIR, UPLOADS_DIR, PROCESS_BIN } = require('../constants')

const { getVisitorsInfo } = require('../db')

const uploadPhoto = async (req, res) => {
  try {
    if (!req.files && !req.files.photo) {
      res.send({
        status: false,
        message: 'No file uploaded',
      })
    } else {
      getVisitorsInfo(async (err, row) => {
        if (err) {
          res.send(500)
          throw err
        }

        const { city, school, age, fileNumber } = row
        const { photo } = req.files

        const data = {
          name: photo.name,
          mimetype: photo.mimetype,
          size: photo.size,
        }

        // move photo to uploads directory
        const filepath = path.join(UPLOADS_DIR, photo.name)
        await photo.mv(filepath)

        const python = spawnSync('bash', [
          '-e',
          PROCESS_BIN,
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
            data,
          })
        } else {
          res.status(500).send()
        }
      })
    }
  } catch (err) {
    res.status(500).send(err)
    throw err
  }
}

module.exports = { uploadPhoto }
