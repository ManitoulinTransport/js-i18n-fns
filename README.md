# js-i18n-fns

> Gettext-like system for static string translation in JavaScript applications

High-level usage:

1. Install
2. Wrap message strings in calls to translation function(s)
3. Extract messages from code
4. Translate messages into other languages

Created to be a gettext-like solution that works for Vue, but should work fine with other frontend frameworks.

As a solution that works with Vue, this is different from other generic gettext-like solutions in the following ways:
- includes translation functions that are members of an object, i.e. pick's up `this.$t('message')`, not just `$t('message')`
- finds translation function calls inside the `<template>` portion of SFCs (Single File Components) compiled with [vue-loader](https://vue-loader.vuejs.org)

Similar to [vue-gettext](https://github.com/Polyconseil/vue-gettext) except:

- portable (all js, no system dependencies)
- more reliable at parsing each file because it uses a real js parser
- simpler (no directive, no component, just a few functions)
- good solution for non-vue applications

## Installing

### 1. Install packages

Replace the version number with that of the most recent release and execute:

```
yarn add --dev https://github.com/ManitoulinTransport/js-i18n-fns/tarball/v1.0.0 transform-loader cross-env
```

### 2. Create js-i18n-fns config file

Create a `js-i18n-fns.config.js` file like this in the root of your project

```js
module.exports = {
  extractedMessagesFile: 'extracted-messages.json',
  functionIdentifier: '$t',
  throwIfInvalidUsage: true,
  localesDir: 'src/i18n/locales',
  nativeLocale: 'en',
  targetLocales: ['fr', 'es']
}
```

### 4. Set up transform for message extraction

#### Transform /w Webpack

Add this to your webpack configuration in the `module.rules` array

```
{
  enforce: 'post',
  test: /\.(js|vue)$/,
  loader: 'transform-loader?js-i18n-fns/transform',
  exclude: /(node_modules)/
}
```

#### /w Browserify

```
  const browserify = require('browserify');
  const fs = require('fs');
  browserify('input.js')
  	.transform('js-i18n-fns/create-transform', {/* options */})
  	.bundle()
  	.pipe(fs.createWriteStream('output.js'));
```

### 4. Add package script for translation task

Add the following to the "scripts" in your package.json:

```
"i18n-translate": "js-i18n-fns-translate"
```
