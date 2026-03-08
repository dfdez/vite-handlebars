import path from 'path';
import { globby } from 'globby';
import { addWatch } from './watch.js';

export const hbsRegisterHelpers = (instance, helpers) => {
  if (!helpers || typeof helpers !== 'object') {
    throw new Error(
      `[vite-plugin-hbs] Helpers module must export a plain object, got: ${typeof helpers}`
    );
  }
  for (const helper in helpers) {
    const helperFunction = helpers[helper];
    if (typeof helperFunction !== 'function') {
      throw new Error(
        `[vite-plugin-hbs] Helper "${helper}" must be a function, got: ${typeof helperFunction}`
      );
    }
    instance.handlebars.registerHelper(helper, helperFunction);
    instance.registered.helpers[helper] = helperFunction;
  }
};

export const registerHelpers = async (instance) => {
  const { helpers, handlebars } = instance;

  if (!helpers || !handlebars) return;

  if (Array.isArray(helpers) || typeof helpers === 'string') {
    let helpersPaths;
    try {
      helpersPaths = await globby(helpers);
    } catch (err) {
      throw new Error(`[vite-plugin-hbs] Failed to resolve helpers glob: ${err.message}`);
    }

    for (const helper of helpersPaths) {
      const resolvedHelper = path.resolve(helper);
      let helperModule;
      try {
        helperModule = (await import(resolvedHelper)).default;
      } catch (err) {
        throw new Error(
          `[vite-plugin-hbs] Failed to import helper module "${resolvedHelper}": ${err.message}`
        );
      }
      hbsRegisterHelpers(instance, helperModule);
      addWatch(instance, resolvedHelper, async (instance) => {
        const reloaded = (await import(resolvedHelper)).default;
        hbsRegisterHelpers(instance, reloaded);
      });
    }
  } else {
    hbsRegisterHelpers(instance, helpers);
  }
};

export default {
  hbsRegisterHelpers,
  registerHelpers,
};
