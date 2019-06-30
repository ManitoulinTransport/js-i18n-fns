// TODO: make it so changes to translations are picked up in dev mode

const fs = require('fs')
const {join} = require('path')

function retrieveTranslationsForLocales (localesDir, targetLocales) {
  const localeTranslations = new Map(targetLocales.map(locale => {
    const filename = join(process.cwd(), localesDir, `${locale}.json`)
    const translations = new Map(Object.entries(
      fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {}
    ))
    return [locale, translations]
  }))

  return function retrieveTranslations (message) {
    return Array.from(localeTranslations)
      .filter(([locale, translations]) => translations.has(message))
      .map(([locale, translations]) => {
        const translation = translations.get(message)
        return [locale, translation]
      })
  }
}

module.exports = { retrieveTranslationsForLocales }
