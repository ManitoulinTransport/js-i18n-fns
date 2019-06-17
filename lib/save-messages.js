const { promisify } = require('util')
const fs = require('fs')
const debounce = require('lodash.debounce')

const [readFile, writeFile, exists] = [fs.readFile, fs.writeFile, fs.exists].map(promisify)

function saveMessagesToFile (file) {
  let messagesToSave = new Set()
  async function saveMessagesToSave () {
    if (messagesToSave.size === 0) {
      return
    }
    const myMessagesToSave = messagesToSave
    messagesToSave = new Set()
    console.log(`js-i18n-fns: Saving ${myMessagesToSave.size} messages to ${file} ...`)
    const originalMessages = (await exists(file)) ? JSON.parse(await readFile(file, 'utf8')) : []
    const updatedMessagesSet = new Set([...originalMessages, ...myMessagesToSave])
    const updatedMessages = [...updatedMessagesSet].sort()
    if (updatedMessages.length > originalMessages.length) {
      await writeFile(file, JSON.stringify(updatedMessages, null, 2))
    }
    console.log(`js-i18n-fns: Saved. ${updatedMessages.length - originalMessages.length} messages were newly added`)
  }
  const debouncedSaveMessagesToSave = debounce(saveMessagesToSave, 3000)
  return function saveMessages(messages) {
    messages.forEach(key => messagesToSave.add(key))
    debouncedSaveMessagesToSave()
  }
}

module.exports = { saveMessagesToFile }
