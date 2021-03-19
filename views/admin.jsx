const React = require('react')
const DefaultLayout = require('./layouts/default')

function HelloMessage(props) {
  return (
    <>
      <DefaultLayout title={props.title}>
        <div>Hello {props.name}</div>
        <div>
          Estado de cámara: <span id="camera-status">desconocido</span>
        </div>
      </DefaultLayout>
      <script
        dangerouslySetInnerHTML={{
          __html: `
const cameraText = document.querySelector('#camera-status')
const ping = () => { fetch('/camera-status').then(response => response.json()).then(data => { cameraText.innerText = data.connected ? 'conectado' : 'desconectado' }) }
ping()
window.setInterval(ping, 10000)`
        }}
      />
    </>
  )
}

module.exports = HelloMessage
