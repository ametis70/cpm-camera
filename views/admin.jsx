const React = require('react')
const DefaultLayout = require('./layouts/default')

function HelloMessage(props) {
  return (
    <>
      <DefaultLayout title={props.title}>
        <form action="/update-info" method="post">
          <div>
            <label>Ciudad: </label>
            <input type="text" name="city" required />
            <p>
              (acutal: <span id="city"> {props.city} </span>)
            </p>
          </div>
          <div>
            <label>Nombre de escuela:</label>
            <input type="text" name="school" required />
            <p>
              (acutal: <span id="school">{props.school}</span>)
            </p>
          </div>
          <div>
            <label>Edad:</label>
            <input type="text" name="age" required />
            <p>
              (acutal: <span id="age">{props.age}</span> )
            </p>
          </div>
          <div>
            <label>Legajo:</label>
            <input type="text" name="file" required />
            <p>
              (acutal: <span id="file">{props.file}</span> )
            </p>
          </div>
          <div>
            <input type="submit" value="Actualizar" />
          </div>
        </form>
        <hr />
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
