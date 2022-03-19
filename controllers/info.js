const { db } = require('../db.js')

const updateInfo = (req, res) => {
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
}

module.exports = { updateInfo }
