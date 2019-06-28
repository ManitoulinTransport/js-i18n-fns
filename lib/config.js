const {relative, join} = require('path')

const projectPath = relative(__dirname, process.cwd())
const configPath = join(projectPath, 'js-i18n-fns.config.js')

let configFile
try {
  configFile = require(configPath)
} catch (e) {
  console.log(`js-i18n-fns: No js-i18n-fns.config.js file found in root of project. Using defaults. `)
  configFile = {}
}

const config = {
  shouldExtract: ('shouldExtract' in configFile) ? configFile.shouldExtract : true,
  extractedMessagesFile: configFile.extractedMessagesFile || 'extracted-messages.json',
  functionIdentifier: configFile.functionIdentifier || '$t',
  throwIfInvalidUsage: ('throwIfInvalidUsage' in configFile) ? configFile.throwIfInvalidUsage : true,
  localesDir: configFile.localesDir || 'src/i18/languages',
  nativeLocale: configFile.nativeLocale || 'en',
  targetLocales: configFile.targetLocales || []
}

module.exports = { config }
