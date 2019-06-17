const {relative, join} = require('path')

const projectPath = relative(__dirname, process.cwd())
const configPath = join(projectPath, 'js-i18n-fns.config.js')

let configFile
try {
  configFile = require(configPath)
} catch (e) {
  configFile = {}
}

const config = {
  extractedMessagesFile: configFile.extractedMessagesFile || 'extracted-messages.json',

  // for extraction
  functionIdentifier: configFile.functionIdentifier || '$t',
  throwIfInvalidUsage: ('throwIfInvalidUsage' in configFile) ? configFile.throwIfInvalidUsage : true, // TODO: test this settings

  // for translation
  localesDir: configFile.localesDir || 'src/i18/locales',
  nativeLocale: configFile.nativeLocale || 'en',
  targetLocales: configFile.targetLocales || []
}

module.exports = { config }
