const flatStream = require('flatstream')
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const {saveMessagesToFile} = require('./save-messages')

function createTransform ({ extractedMessagesFile, functionIdentifier, throwIfInvalidUsage }) {
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

        const messages = new Set()
        traverse(ast, {
          CallExpression (path) {
            const isCallOfPlainIdentifier = () => path.get('callee').isIdentifier({name: functionIdentifier})
            const isCallOfMethod = () => path.get('callee').isMemberExpression() && path.get('callee.property').isIdentifier({name: functionIdentifier})
            if (isCallOfPlainIdentifier() || isCallOfMethod()) {
              const firstArgument = path.get('arguments.0')
              if (!firstArgument.isStringLiteral()) {
                if (throwIfInvalidUsage) {
                  throw new Error(`js-i18n-fns: argument to ${functionIdentifier} function must be a string literal (using '' or ""): got ${JSON.stringify(firstArgument.node)} (in file ${JSON.stringify(file)})`)
                } else {
                  return
                }
              }
              messages.add(firstArgument.node.value)
            }
          }
        })
        saveMessages(messages)

        return buffer
      }
    })
  }
}

module.exports = { createTransform }
