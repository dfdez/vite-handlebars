import { globby } from 'globby';
import { addWatch } from './watch.js';

export const hbsRegisterHelpers = (instance, helpers) => {
  for (const helper in helpers) {
    const helperFunction = helpers[helper];
    instance.handlebars.registerHelper(helper, helperFunction);
    instance.registered.helpers[helper] = helperFunction;
  }
};

export async function registerHelpers(instance) {
  const { helpers, handlebars } = instance;

  if (!helpers || !handlebars) return;

  if (Array.isArray(helpers) || typeof helpers === 'string') {
    const helpersPaths = await globby(helpers);
    for (const helper of helpersPaths) {
      const helpers = (await import(helper)).default;
      hbsRegisterHelpers(instance, helpers);
      addWatch(instance, helpers, (instance) => {
        hbsRegisterHelpers(instance, helper);
      });
    }
  } else {
    hbsRegisterHelpers(instance, helpers);
  }
}

export default {
  hbsRegisterHelpers,
  registerHelpers
};