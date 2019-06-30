const {join, relative} = require('path')
const fs = require('fs')
const flatStream = require('flatstream')
const {parse} = require('@babel/parser')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generate = require('@babel/generator').default
const {saveMessagesToFile} = require('./save-messages')
const {retrieveTranslationsForLocales} = require('./retrieve-translations')

function clone (input) {
  return JSON.parse(JSON.stringify(input))
}

function createTransform ({shouldExtract, extractedMessagesFile, functionIdentifier, throwIfInvalidUsage, localesDir, targetLocales}) {
  const saveMessages = saveMessagesToFile(extractedMessagesFile)
  const retrieveTranslations = retrieveTranslationsForLocales(localesDir, targetLocales)
  return function transformGettext (file) {
    return flatStream({
      transform (buffer) {
        const code = buffer.toString('utf8')

        // if code starts with any amount of whitespace & then a `<`, then it's probably a vue template,
        //    and otherwise definitely not valid javascript, so ignore it
        if (/^\W*</m.test(code)) {
          return buffer
        }

        const simpleFilename = relative(process.cwd(), file.replace(/\?.*/, ''))

        const ast = parse(code, {
          sourceType: 'unambiguous',
          sourceFilename: simpleFilename,
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

        occurrences.forEach(occurrence => {
          const message = occurrence.node.arguments[0].value
          occurrence.get('arguments.0').replaceWith(
            t.callExpression(
              t.memberExpression(clone(occurrence.node.callee), t.identifier('getMessage')),
              [
                t.stringLiteral(message),
                t.objectExpression(retrieveTranslations(message).map(([locale, translation]) => t.objectProperty(t.stringLiteral(locale), t.stringLiteral(translation))))
              ]
            )
          )
        })

        return generate(ast, {
          retainLines: true,
          filename: simpleFilename
        }, code).code
      }
    })
  }
}

module.exports = {createTransform}
