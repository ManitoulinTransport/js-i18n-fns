const {createTransform} = require('./lib/create-transform')
const {config} = require('./lib/config')

module.exports = createTransform(config)
