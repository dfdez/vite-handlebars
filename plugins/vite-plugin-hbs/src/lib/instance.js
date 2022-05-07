import Handlebars from 'handlebars';
import path from 'path';

import { registerPartials } from './partials.js';
import { registerHelpers } from './helpers.js';
import { compile } from './compile.js';
import { addWatch } from './watch.js';

export const instances = {};

export async function createInstance(config, file, { rollup, emit } = {}) {
  const options = config[file];

  const instance = createInstanceObject(options, { rollup, path: path.resolve(file) });

  await registerPartials(instance);
  await registerHelpers(instance);
  compile(instance, { emit });

  addWatch(instance, instance.path);
}

export function createInstanceObject(options, { rollup, path } = {}) {
  return instances[path] = { ...options, rollup, path, handlebars: Handlebars.create(), registered: { helpers: {} } };
}

export default {
  instances,
  createInstance,
  createInstanceObject
};