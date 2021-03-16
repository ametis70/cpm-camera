const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = 'db.sqlite'

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message)
    throw err
  }
})

function registerUser(username = 'admin', password = 'admin') {
  const sql = 'SELECT * FROM user'
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err
    }
    if (rows.length > 0) {
      console.warn(`user ${username} already exists`)
      return
    }
    const insert = 'INSERT INTO user (user, password) VALUES (?,?)'
    db.run(insert, [username, password])
  })
}

const getUser = () => {
  const sql = 'SELECT * FROM user'
  db.get(sql, [], (err, row) => {
    if (err) {
      throw err
    }
    console.log(row)
    return row
  })
}

db.serialize(() => {
  console.log('Connected to the SQLite database.')
  db.run(
    `CREATE TABLE IF NOT EXISTS user (
            user text UNIQUE PRIMARY KEY,
            password text,
            CONSTRAINT user_unique UNIQUE (user)
            )`,
    (err) => {
      if (err) {
        throw err
      } else if (process.env.NODE_ENV !== 'production') {
        db.serialize(() => {
          registerUser()
          getUser()
        })
      }
    }
  )
})

module.exports = db
