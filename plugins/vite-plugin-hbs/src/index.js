import { instances, createInstance, createInstanceObject } from './lib/instance.js';
import { watch } from './lib/watch.js';
import { emitFiles } from './lib/compile.js';

export default (config) => {
  let emit;

  return {
    name: 'handlebars-parser',
    configResolved(config) {
      emit = config.command !== 'serve';
    },
    async buildStart() {
      for (const file in config) {
        await createInstance(config, file, { rollup: this, emit });
      }
    },
    async handleHotUpdate({ server, file }) {
      const watchInstance = watch[file];
      if (watchInstance) {
        watchInstance.compile();

        server.ws.send({
          type: 'full-reload',
        });

        return [];
      }
    },
    transform(src, id) {
      if (id.endsWith('.hbs')) {
        const { handlebars, registered } = instances[id] || createInstanceObject(null, { rollup: this, path: id });
        const { partials } = handlebars;

        const partialsParsed = JSON.stringify(partials);
        const parsedHelpers = Object.entries(registered.helpers);

        const code = `
          import Handlebars from 'handlebars';
          const handlebars = Handlebars.create();

          handlebars.partials = ${partialsParsed};

          const helpers = { ${parsedHelpers.map(([key, value]) => `${key}: ${value}`)} };
          Object.entries(helpers).forEach(([key, value]) => handlebars.registerHelper(key, value));

          export default handlebars.compile(\`${src}\`);
          `;
        return {
          code,
          map: null
        };
      }
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, { filename }) {
        const { handlebars, data } = instances[filename] || createInstanceObject(null, { rollup: this, path: filename });
        return handlebars.compile(html)(data);
      }
    },
    generateBundle() {
      emitFiles.forEach(this.emitFile);
    }
  };
};
