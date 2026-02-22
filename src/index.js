/* global process */

import fs from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import enhancedResolve from 'enhanced-resolve';

import { interpolateName } from 'loader-utils';

const defaultOptions = {
  name: '[name].[ext]?[sha512:hash:base64:7]',
};

export default function transformAssets({ types: t }) {
  function resolveModulePath(filename) {
    const dir = dirname(filename);

    if (isAbsolute(dir)) {
      return dir;
    }

    if (process.env.PWD) {
      return resolve(process.env.PWD, dir);
    }

    return resolve(dir);
  }

  return {
    visitor: {
      CallExpression(path, { file, opts }) {
        const currentConfig = {
          ...defaultOptions,
          ...opts,
        };

        if (typeof currentConfig.name !== 'string') {
          return;
        }

        currentConfig.extensions ||= [];

        const {
          arguments: args,
          callee: {
            name: calleeName,
          },
        } = path.node;

        if (calleeName !== 'require' || !args.length || !t.isStringLiteral(args[0])) {
          return;
        }

        if (currentConfig.extensions.find(
          (ext) => args[0].value.endsWith(ext),
        )) {
          const [{ value: filePath }] = args;

          if (t.isExpressionStatement(path.parent)) path.remove();
          else {
            const from = resolveModulePath(file.opts.filename);

            const resourcePath = enhancedResolve.sync(from, filePath);

            const p = interpolateName({
              resourcePath,
            }, currentConfig.name, {
              content: fs.readFileSync(resourcePath),
              context: from,
            });

            // eslint-disable-next-line @babel/new-cap
            path.replaceWith(t.StringLiteral(p));
          }
        }
      },
    },
  };
}
