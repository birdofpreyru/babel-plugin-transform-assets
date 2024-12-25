# Babel Plugin Transform Assets

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/babel-plugin-transform-assets.svg)](https://www.npmjs.com/package/@dr.pogodin/babel-plugin-transform-assets)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/babel-plugin-transform-assets.svg)](https://www.npmjs.com/package/@dr.pogodin/babel-plugin-transform-assets)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/babel-plugin-transform-assets?style=social)](https://github.com/birdofpreyru/babel-plugin-transform-assets)

Transforms importing of asset files at compile time using Babel. This plugin removes the need to run your server code through [Webpack](https://github.com/webpack/webpack) module bundler when using loaders such as file-loader, url-loader and building <s>isomorphic</s> universal apps. Aids in creating a cleaner, maintainable build process at the cost of yet another [Babel](https://github.com/babel/babel) [plugin](https://babeljs.io/docs/plugins/).

[![Sponsor](https://raw.githubusercontent.com/birdofpreyru/babel-plugin-transform-assets/refs/heads/master/.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

---
_This is a fork of [`babel-plugin-transform-assets`](https://www.npmjs.com/package/babel-plugin-transform-assets) upgraded to be compatible with the latest Webpack's `file-loder`, and to use the latest versions of all dependencies. For migration just prefix the plugin name with `@dr.pogodin/` scopename in your `package.json` and Babel configs._

---

## Example

```js
import file from '../file.txt';
```

will be transformed to

```js
var file = 'file.txt?9LDjftP';
```

See the spec for [more examples](https://github.com/birdofpreyru/babel-plugin-transform-assets/blob/master/test/index.spec.js).

## Requirements
[Babel](https://github.com/babel/babel) v6 or higher.

## Installation

```sh
npm install -D @dr.pogodin/babel-plugin-transform-assets
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
      ["@dr.pogodin/transform-assets", {
          "extensions": ["svg"],
          "name": "[name].[ext]?[sha512:hash:base64:7]"
      }]
  ]
}
```

### Via Node API

```javascript
require('babel-core').transform('code', {
    plugins: [
        ['@dr.pogodin/transform-assets', {
            extensions: ['svg'],
            name: '[name].[ext]?[sha512:hash:base64:7]',
        }]
    ]
});
```

### Contributing

Contributions are very welcome—bug fixes, features, documentation, tests. Just make sure the tests are passing.
