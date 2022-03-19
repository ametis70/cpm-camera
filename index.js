const path = require('path')

const express = require('express')
const multer = require('multer')
const expressReactViews = require('express-react-views')
const cors = require('cors')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')

const processedController = require('./controllers/processed')
const infoController = require('./controllers/info')
const photoController = require('./controllers/photo')
const cameraController = require('./controllers/camera')
const adminController = require('./controllers/admin')

const { UPLOADS_DIR, PROCESSED_IMAGES_DIR, WEBSITE_DIR } = require('./constants')

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

const port = process.env.PORT || 4000

app.use('/css', express.static(path.join(__dirname, '/css')))
app.get('/admin', ensureAuthenticated, adminController.view)

const upload = multer({ dest: UPLOADS_DIR })
app.post('/photo', upload.single('photo'), photoController.uploadPhoto)

app.post('/info', infoController.updateInfo)
app.get('/processed/random', processedController.getRandom)
app.use('/processed', express.static(PROCESSED_IMAGES_DIR))
app.get('/camera/status', cameraController.getStatus)

app.use(express.static(WEBSITE_DIR))
app.get('/', (_, res) => {
  res.sendFile(WEBSITE_DIR)
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}.`)
})
