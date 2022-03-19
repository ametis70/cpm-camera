const { spawn } = require('child_process')

const cameraHost = process.env.CAMERA_HOST

if (!cameraHost) {
  console.warn('No camera host specified in CAMERA_HOST env var')
}

const getStatus = (_, res) => {
  if (!cameraHost) {
    return res.json({ connected: false })
  }

  const ping = spawn('ping', ['-c1', cameraHost])
  ping.addListener('exit', (exitCode) => {
    res.json({ connected: exitCode === 0 })
  })
}

module.exports = { getStatus }
