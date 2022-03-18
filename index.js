const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const morgan = require('morgan')
const { spawn, spawnSync } = require('child_process')
const path = require('path')
const { sample, remove } = require('lodash')
const fs = require('fs')
const moment = require('moment-timezone')
const expressReactViews = require('express-react-views')
const passport = require('passport')
const session = require('express-session')
const {
  STORAGE_DIR,
  PROCESSED_IMAGES_DIR,
  UPLOADS_DIR,
  PROCESS_BIN,
  WEBSITE_DIR
} = require('./constants')

const dirs = [STORAGE_DIR, PROCESSED_IMAGES_DIR, UPLOADS_DIR]

dirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    return
  }

  fs.mkdirSync(dir)
})

const { db, getVisitorsInfo } = require('./db')
const routes = require('./routes')
const { authRouter, ensureAuthenticated, initPassport } = require('./auth')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(session({ secret: 'cats', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
initPassport()
app.use(authRouter)

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'jsx')
app.engine('jsx', expressReactViews.createEngine())

app.use('/css', express.static(path.join(__dirname, '/css')))

app.use(
  fileUpload({
    createParentPath: true
  })
)

app.get('/admin', ensureAuthenticated, routes.admin)

const port = process.env.PORT || 4000

const day = moment.tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD')

app.post('/update-info', (req, res) => {
  const { city, school, age, file } = req.body

  if (!city || !school || !age || !file) {
    res.send(400)
  }

  db.serialize(() => {
    db.run(
      'REPLACE INTO visitorsinfo (id, city, school, age, file) VALUES (0, ?, ?, ?, ?)',
      [city, school, age, file],
      (err) => {
        if (err) {
          throw err
        }
      }
    )
  })
  res.redirect('/admin')
})

app.post('/upload-photo', async (req, res) => {
  try {
    if (!req.files && !req.files.photo) {
      res.send({
        status: false,
        message: 'No file uploaded'
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
          size: photo.size
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
          PROCESSED_IMAGES_DIR
        ])
        console.log('stdout: ', python.stdout.toString('utf8'))
        console.log('stderr: ', python.stderr.toString('utf8'))

        if (python.status === 0) {
          res.send({
            status: true,
            message: 'Photo uploaded and processed succesfully',
            data
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
})

let lastFile

app.get('/processed/random', (_, res) => {
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
    url: `/processed/${file}`,
    timestamp: new Date().getTime()
  })
})

app.use('/processed', express.static(PROCESSED_IMAGES_DIR))

app.use(express.static(WEBSITE_DIR))
app.get('/', (_, res) => {
  res.sendFile(WEBSITE_DIR)
})

app.get('/camera/status', (_, res) => {
  const cameraHost = '192.168.1.64'
  const ping = spawn('ping', ['-c1', cameraHost])
  ping.addListener('exit', (exitCode) => {
    res.json({ connected: exitCode === 0 })
  })
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}.`)
})
