/* global process */

import fs from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import enhancedResolve from 'enhanced-resolve';

import { type LoaderInterpolateOption, interpolateName } from 'loader-utils';

import type { LoaderContext } from 'webpack';

import type * as Babel from '@babel/core';

type OptionsT = {
  extensions?: string[];
  name?: string;
}

const defaultOptions: OptionsT = {
  name: '[name].[ext]?[sha512:hash:base64:7]',
};

export default function transformAssets({
  types: t,
}: typeof Babel): Babel.PluginObject<Babel.PluginPass<OptionsT>> {
  function resolveModulePath(filename: string) {
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
          arguments: [arg0],
          callee,
        } = path.node;

        if (
          !('name' in callee)
          || callee.name !== 'require'
          || !t.isStringLiteral(arg0)
        ) return;

        const filePath = arg0.value;

        if (
          currentConfig.extensions.find(
          (ext) => filePath.endsWith(ext),
        )) {
          if (t.isExpressionStatement(path.parent)) path.remove();
          else {
            if (file.opts.filename === undefined) {
              throw Error('"filename" is undefined');
            }
            const from = resolveModulePath(file.opts.filename);

            const resourcePath = enhancedResolve.sync(from, filePath);
            if (resourcePath === false) throw Error('Resolution failed');

            const p = interpolateName({
              resourcePath,
            } as LoaderContext<LoaderInterpolateOption>,
            currentConfig.name,
            {
              content: fs.readFileSync(resourcePath),
              context: from,
            });

            path.replaceWith(t.stringLiteral(p));
          }
        }
      },

      // TODO: For now, I just copy/paste the logic from the require() visitor
      // above... later the common logic should be split into dedicated functions.
      ImportDeclaration(path, { file, opts }) {
        const currentConfig = {
          extensions: [],
          ...defaultOptions,
          ...opts,
        };

        if (typeof currentConfig.name !== 'string') {
          return;
        }

        const filePath = path.node.source.value;

        if (currentConfig.extensions.find((ext) => filePath.endsWith(ext))) {
          const defaultSpecifier = path.node.specifiers.find(
            (node) => node.type === 'ImportDefaultSpecifier',
          );
          if (!defaultSpecifier) path.remove();
          else {
            const name = defaultSpecifier.local.name;

            if (file.opts.filename === undefined) {
              throw Error('"filename" is undefined');
            }
            const from = resolveModulePath(file.opts.filename);

            const resourcePath = enhancedResolve.sync(from, filePath);
            if (resourcePath === false) throw Error('Resolution failed');

            const p = interpolateName({
              resourcePath,
            } as LoaderContext<LoaderInterpolateOption>,
            currentConfig.name,
            {
              content: fs.readFileSync(resourcePath),
              context: from,
            });

            path.replaceWith(
              t.variableDeclaration(
                'const',
                [t.variableDeclarator(t.identifier(name), t.stringLiteral(p))],
              ),
            );
          }
        }
      }
    },
  };
}
