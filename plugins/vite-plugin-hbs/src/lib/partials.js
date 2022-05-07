import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import { addWatch } from './watch.js';

export function hbsRegisterPartial(instance, partial) {
  const partialData = fs.readFileSync(partial).toString();
  const partialName = path.basename(partial).replace('.hbs', '');
  instance.handlebars.registerPartial(partialName, partialData);
}

export async function registerPartials(instance) {
  const { partials, handlebars } = instance;

  if (!partials || !handlebars) return;

  const partialsPaths = await globby(partials);
  for (const partial of partialsPaths) {
    const solvedPartial = path.resolve(partial);
    hbsRegisterPartial(instance, solvedPartial);
    addWatch(instance, solvedPartial, (instance) => {
      hbsRegisterPartial(instance, partial);
    })
  }
}

export default {
  hbsRegisterPartial,
  registerPartials
};