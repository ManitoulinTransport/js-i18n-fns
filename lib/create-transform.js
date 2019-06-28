const {relative} = require('path')
const flatStream = require('flatstream')
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const {saveMessagesToFile} = require('./save-messages')

function createTransform ({ shouldExtract, extractedMessagesFile, functionIdentifier, throwIfInvalidUsage }) {
  const saveMessages = saveMessagesToFile(extractedMessagesFile)
  return function transformGettext (file) {
    return flatStream({
      transform (buffer) {
        const code = buffer.toString('utf8')

        // if code starts with any amount of whitespace & then a `<`, then it's probably a vue template,
        //    and otherwise definitely not valid javascript, so ignore it
        if (/^\W*</m.test(code)) {
          return buffer
        }
        const ast = parse(code, {
          sourceextractedMessagesFile: file,
          sourceType: 'unambiguous',
          plugins: [
            'dynamicImport',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'importMeta',
          ]
        })

        let occurrences = []

        traverse(ast, {
          CallExpression (path) {
            const isCallOfPlainIdentifier = () => path.get('callee').isIdentifier({name: functionIdentifier})
            const isCallOfMethod = () => path.get('callee').isMemberExpression() && path.get('callee.property').isIdentifier({name: functionIdentifier})
            const isOccurrence = isCallOfPlainIdentifier() || isCallOfMethod()
            if (isOccurrence) {
              occurrences.push(path)
            }
          }
        })

        const isOccurrenceValid = occurrence => occurrence.get('arguments.0').isStringLiteral()
        if (!occurrences.every(isOccurrenceValid)) {
          const simpleFilename = relative(process.cwd(), file.replace(/\?.*/, ''))
          const message = `js-i18n-fns: invalid usage of ${functionIdentifier} function in ${simpleFilename}: first argument is not a string literal (using '' or "")`
          if (throwIfInvalidUsage) {
            throw new Error(message)
          } else {
            console.log(message)
            occurrences = occurrences.filter(isOccurrenceValid)
          }
        }

        if (shouldExtract) {
          const messages = new Set(occurrences.map(occurrence => occurrence.get('arguments.0').node.value))
          saveMessages(messages)
        }

        return buffer
      }
    })
  }
}

module.exports = { createTransform }
