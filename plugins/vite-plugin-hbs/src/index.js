import { instances, createInstance, createInstanceObject } from './lib/instance.js';
import { watch } from './lib/watch.js';
import { emitFiles } from './lib/compile.js';

const validateConfig = (config) => {
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(
      '[vite-plugin-hbs] Plugin config must be a plain object mapping file paths to options.'
    );
  }
  for (const key of Object.keys(config)) {
    const entry = config[key];
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`[vite-plugin-hbs] Config entry for "${key}" must be a plain object.`);
    }
    if (entry.outDir !== undefined && typeof entry.outDir !== 'string') {
      throw new Error(`[vite-plugin-hbs] "outDir" for "${key}" must be a string.`);
    }
    if (
      entry.partials !== undefined &&
      typeof entry.partials !== 'string' &&
      !Array.isArray(entry.partials)
    ) {
      throw new Error(
        `[vite-plugin-hbs] "partials" for "${key}" must be a string or array of strings.`
      );
    }
    if (entry.data !== undefined && (entry.data === null || typeof entry.data !== 'object')) {
      throw new Error(`[vite-plugin-hbs] "data" for "${key}" must be a plain object.`);
    }
    if (
      entry.compile !== undefined &&
      (entry.compile === null || typeof entry.compile !== 'object')
    ) {
      throw new Error(`[vite-plugin-hbs] "compile" for "${key}" must be a plain object.`);
    }
  }
};

export default (pluginConfig) => {
  validateConfig(pluginConfig);

  let emit;

  return {
    name: 'handlebars-parser',
    configResolved(resolvedConfig) {
      emit = resolvedConfig.command !== 'serve';
    },
    async buildStart() {
      for (const file in pluginConfig) {
        await createInstance(pluginConfig, file, { rollup: this, emit });
      }
    },
    async handleHotUpdate({ server, file }) {
      const watchInstance = watch[file];
      if (watchInstance) {
        await watchInstance.compile();

        server.ws.send({
          type: 'full-reload',
        });

        return [];
      }
    },
    transform(src, id) {
      if (id.endsWith('.hbs')) {
        const { handlebars, registered } =
          instances[id] || createInstanceObject(null, { rollup: this, path: id });
        const { partials } = handlebars;

        const partialsParsed = JSON.stringify(partials);
        const parsedHelpers = Object.entries(registered.helpers);

        // Escape backticks and template literal delimiters so the generated
        // module is valid even when the source template contains backticks.
        const escapedSrc = src.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

        const code = `
          import Handlebars from 'handlebars';
          const handlebars = Handlebars.create();

          handlebars.partials = ${partialsParsed};

          const helpers = { ${parsedHelpers.map(([key, value]) => `${key}: ${value}`)} };
          Object.entries(helpers).forEach(([key, value]) => handlebars.registerHelper(key, value));

          export default handlebars.compile(\`${escapedSrc}\`);
          `;
        return {
          code,
          map: null,
        };
      }
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, { filename }) {
        const { handlebars, data } =
          instances[filename] || createInstanceObject(null, { rollup: this, path: filename });
        try {
          return handlebars.compile(html)(data);
        } catch (err) {
          throw new Error(
            `[vite-plugin-hbs] Failed to compile HTML template "${filename}": ${err.message}`
          );
        }
      },
    },
    generateBundle() {
      emitFiles.forEach(this.emitFile.bind(this));
    },
  };
};
