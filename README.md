# js-i18n-fns

> Gettext-like system for static string translation in JavaScript applications

High-level usage:

1. Wrap message strings in calls to translation function(s)
2. Extract messages from code
3. Translate messages into other languages

Created to be a gettext-like solution that works for Vue, but should work fine with other frontend frameworks.

As a solution that works with Vue, this is different from other generic gettext-like solutions in the following ways:
- includes translation functions that are members of an object, i.e. pick's up `this.$t('message')`, not just `$t('message')`
- finds translation function calls inside the `<template>` portion of SFCs (Single File Components) compiled with [vue-loader](https://vue-loader.vuejs.org)

Similar to [vue-gettext](https://github.com/Polyconseil/vue-gettext) except:

- portable (all js, no system dependencies)
- more reliable at parsing each file because it uses a real js parser
- simpler (no directive, no component, just one simple function which you define)
- good solution for non-vue applications

## Installing

### 1. Install packages

Replace the version number with that of the most recent release and execute:

```
yarn add --dev https://github.com/ManitoulinTransport/js-i18n-fns/tarball/v1.0.0 transform-loader
```

### 2. Create js-i18n-fns config file

Create a `js-i18n-fns.config.js` file like this in the root of your project

```js
module.exports = {
  shouldExtract: true,
  extractedMessagesFile: 'extracted-messages.json',
  functionIdentifier: '$t',
  localesDir: 'src/i18n/locales',
  nativeLocale: 'en',
  targetLocales: ['fr', 'es']
}
```

### 3. Set up transform for message extraction & translation inlining

Add this to your webpack configuration in the `module.rules` array

```
{
  enforce: 'post',
  test: /\.(js|vue)$/,
  loader: 'transform-loader?js-i18n-fns/transform',
  exclude: /(node_modules)/
}
```

**Note: It is recommended to disable this for active development, since (1) it slows down the build significantly, and (2) you will lose source-map support**

### 4. Define translation function

A basic example that you can expand on:

```js
let currentLocale = 'en'

export function setLocale (newLocale) {
    currentLocale = newLocal
}

export function $t (message) {
  return message
}

$t.getMessage = (originalMessage, translatedMessages) => {
  return translatedMessages.hasOwnProperty(currentLanguage) ? translatedMessages[currentLanguage] : originalMessage
}
```

The result of `$t.getMessage` will be passed as the first argument to `$t`.

### 5. Add package script for translation task

Add the following to the "scripts" in your package.json:

```
"i18n-translate": "js-i18n-fns-translate"
```

Run this to automatically translate every message in `extractedMessagesFile` into every language in `targetLocales` and save into files in `localesDir`
