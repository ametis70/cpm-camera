const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcryptjs')
const path = require('path')
const { STORAGE_DIR } = require('./constants')

const DB_FILE = path.join(STORAGE_DIR, 'db.sqlite')

const db = new sqlite3.Database(DB_FILE, (err) => {
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
    const insert = 'INSERT INTO user (username, password) VALUES (?,?)'
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    db.run(insert, [username, hash])
  })
}

const getUser = (cb) => {
  const sql = 'SELECT * FROM user'
  db.get(sql, [], (err, row) => {
    if (cb) {
      cb(err, row)
    } else if (err) {
      throw err
    }
    return row
  })
}

const getVisitorsInfo = (cb) => {
  const sql = 'SELECT * FROM visitorsinfo'
  db.get(sql, [], (err, row) => {
    if (cb) {
      cb(err, row)
    } else if (err) {
      throw err
    }
    return row
  })
}

db.serialize(() => {
  console.log('Connected to the SQLite database.')
  db.run(
    `CREATE TABLE IF NOT EXISTS user (
            username text UNIQUE PRIMARY KEY,
            password text,
            CONSTRAINT user_unique UNIQUE (username)
            )`,
    (err) => {
      if (err) {
        throw err
      } else if (process.env.NODE_ENV !== 'production') {
        //        db.serialize(() => {
        //          registerUser()
        //          getUser()
        //        })
      }
    }
  )
  db.run('DROP TABLE IF EXISTS visitorsinfo')
  db.run(
    `CREATE TABLE visitorsinfo (
            id integer UNIQUE PRIMARY KEY,
            city text,
            school text,
            age text,
            file text
            )`,
    (err) => {
      if (err) {
        throw err
      }
    }
  )
  db.run(
    "INSERT INTO visitorsinfo (id, city, school, age, file) VALUES (0, '', '', '', '')",
    (err) => {
      if (err) throw err
    }
  )
})

module.exports = { db, getUser, registerUser, getVisitorsInfo }
