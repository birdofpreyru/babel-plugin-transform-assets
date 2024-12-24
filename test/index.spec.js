import { transformFileSync } from '@babel/core';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import Vinyl from 'vinyl';
import gulpBabel from 'gulp-babel';
import { vol, fs as memfs } from 'memfs';
import { ufs } from 'unionfs';
import { patchFs } from 'fs-monkey';
import withThese from 'mocha-each';

describe('transforms assets', () => {
  before(() => {
    const ofs = { ...fs };
    vol.fromJSON({
      './node_modules/fake-module/file.txt': fs.readFileSync(path.join(__dirname, './file.txt'), 'utf-8'),
    });
    vol.writeFileSync('./node_modules/fake-module/logo.png', fs.readFileSync(path.join(__dirname, 'fixtures/logo.png')));
    ufs.use(memfs).use(ofs);
    patchFs(ufs);
  });

  const transform = (filename, config = {}) => transformFileSync(
    path.resolve(__dirname, filename),
    {
      babelrc: false,
      presets: ['@babel/env'],
      plugins: [
        ['./src/index.js', config],
      ],
    },
  );
  withThese([
    ['a local file', ''],
    ['located within a Node.js module', '-from-node-module'],
  ]).describe('when asset is %s', (description, suffix) => {
    it('replaces require statements with filename', () => {
      expect(transform(`fixtures/require-txt${suffix}.js`, {
        extensions: ['txt'],
      }).code).to.be.equal(`"use strict";

var file = "file.txt?vmiIOMq";`);
    });

    it('replaces import statements with filename', () => {
      expect(transform(`fixtures/import-txt${suffix}.js`, {
        extensions: ['txt'],
      }).code).to.be.equal(`"use strict";

var _file = _interopRequireDefault("file.txt?vmiIOMq");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }`);
    });

    it('replaces import statements with filename and then exports', () => {
      expect(transform(`fixtures/import-export-txt${suffix}.js`, {
        extensions: ['txt'],
      }).code).to.be.equal(`"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "file", {
  enumerable: true,
  get: function get() {
    return _file["default"];
  }
});
var _file = _interopRequireDefault("file.txt?vmiIOMq");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }`);
    });

    it('replaces import statement with filename via gulp', (cb) => {
      const stream = gulpBabel({
        babelrc: false,
        presets: ['@babel/env'],
        plugins: [
          ['./src/index.js', { extensions: ['txt'] }],
        ],
      });

      stream.on('data', (file) => {
        expect(file.contents.toString()).to.be.equal(`"use strict";

var _file = _interopRequireDefault("file.txt?vmiIOMq");

function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }`);
      });

      stream.on('end', cb);

      stream.write(new Vinyl({
        cwd: __dirname,
        base: path.join(__dirname, 'fixtures'),
        path: path.join(__dirname, `fixtures/import-txt${suffix}.js`),
        contents: fs.readFileSync(path.join(__dirname, `fixtures/import-txt${suffix}.js`)),
      }));

      stream.end();
    });

    it('removes global requires', () => {
      expect(transform(`fixtures/empty-require${suffix}.js`, {
        extensions: ['txt'],
      }).code).to.be.equal('"use strict";');
    });

    it('fixtures/empty-import.js', () => {
      expect(transform(`fixtures/empty-import${suffix}.js`, {
        extensions: ['txt'],
      }).code).to.be.equal('"use strict";');
    });

    it('fixtures/png-import.js with [contenthash] in name', () => {
      expect(transform(`fixtures/png-import${suffix}.js`, {
        extensions: ['png'],
        name: '/images/[contenthash].[ext]',
      }).code).to.be.equal(`"use strict";

var _logo = _interopRequireDefault("/images/b096687fd2b2c782.png");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }`);
    });
  });
});
