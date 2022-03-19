const path = require('path')

const STORAGE_DIR = path.join(__dirname, 'storage')
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads')
const PROCESSED_IMAGES_DIR = path.join(STORAGE_DIR, 'processed')

const PROCESS_BIN = path.join(__dirname, 'process', 'process')
const WEBSITE_DIR = path.join(__dirname, 'website', 'build')

module.exports = {
  STORAGE_DIR,
  UPLOADS_DIR,
  PROCESSED_IMAGES_DIR,
  PROCESS_BIN,
  WEBSITE_DIR,
}
