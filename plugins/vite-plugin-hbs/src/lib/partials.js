import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import { addWatch } from './watch.js';

export const hbsRegisterPartial = (instance, partial) => {
  let partialData;
  try {
    partialData = fs.readFileSync(partial, 'utf-8');
  } catch (err) {
    throw new Error(`[vite-plugin-hbs] Failed to read partial "${partial}": ${err.message}`);
  }
  const partialName = path.basename(partial, '.hbs');
  instance.handlebars.registerPartial(partialName, partialData);
};

export const registerPartials = async (instance) => {
  const { partials, handlebars } = instance;

  if (!partials || !handlebars) return;

  let partialsPaths;
  try {
    partialsPaths = await globby(partials);
  } catch (err) {
    throw new Error(
      `[vite-plugin-hbs] Failed to resolve partials glob "${partials}": ${err.message}`
    );
  }

  for (const partial of partialsPaths) {
    const solvedPartial = path.resolve(partial);
    hbsRegisterPartial(instance, solvedPartial);
    addWatch(instance, solvedPartial, (instance) => {
      hbsRegisterPartial(instance, solvedPartial);
    });
  }
};

export default {
  hbsRegisterPartial,
  registerPartials,
};
