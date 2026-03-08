import { compile } from './compile.js';

export const watch = {};

const compileInstances = (path, precompile) => () => {
  const { instances } = watch[path];
  instances.forEach((instance) => {
    precompile && precompile(instance);
    compile(instance);
  });
};

export const addWatch = (instance, path, precompile) => {
  if (!watch[path]) watch[path] = { instances: [], compile: compileInstances(path, precompile) };

  watch[path].instances.push(instance);

  instance.rollup.addWatchFile(path);
};

export default {
  watch,
  addWatch,
};
