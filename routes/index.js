const admin = (_req, res) => {
  res.render('admin', { name: 'john' })
}

module.exports = { admin }
