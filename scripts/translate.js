#!/usr/bin/env node

const {relative, join} = require('path')
const {promisify} = require('util')
const fs = require('fs')
const translate = require('@vitalets/google-translate-api')
const config = require('../lib/config')

const [readFile, writeFile, exists] = [fs.readFile, fs.writeFile, fs.exists].map(promisify)

const {extractedMessagesFile, localesDir, nativeLocale, targetLocales} = config

;(async () => {
  const extractedMessages = JSON.parse(await readFile(join(process.cwd(), extractedMessagesFile), 'utf8'))
  for (const targetLocale of targetLocales) {
    const targetFilename = join(process.cwd(), localesDir, `${targetLocale}.json`)
    const targetContents = (await exists(targetFilename)) ? JSON.parse(await readFile(targetFilename, 'utf8')) : {}
    const messagesToTranslate = extractedMessages.filter(message => !targetContents[message])
    console.log(`Populating ${messagesToTranslate.length} translations for ${targetLocale}...`)
    for (const message of messagesToTranslate) {
      const result = await translate(message, {from: nativeLocale, to: targetLocale})
      if (result.from.text.autoCorrected || result.from.text.didYouMean) {
        console.log(`Warning: Message ${JSON.stringify(message)} was autocorrected to ${JSON.stringify(result.from.text.value)}`)
      }
      targetContents[message] = result.text
    }
    await writeFile(targetFilename, JSON.stringify(sortByKeys(targetContents), null, 2))
  }
})().catch(error => {
  console.error(error)
  process.exit(1)
})

function sortByKeys (input) {
  const output = {}
  for (const key of Object.keys(input).sort()) {
    output[key] = input[key]
  }
  return output
}
