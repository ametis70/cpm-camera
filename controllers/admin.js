const { getVisitorsInfo } = require('../db')

const view = (_req, res) => {
  getVisitorsInfo((err, row) => {
    if (err) {
      res.send(500)
      throw err
    }
    res.render('admin', { ...row })
  })
}

module.exports = { view }
