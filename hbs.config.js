export default {
  './src/index.html': {
    partials: './src/partials/**',
    data: {
      title: 'Handlebars'
    },
    helpers: {
      concat(foo, bar) {
        return `${foo} ${bar}`;
      }
    },
    compile: {
      'variant.html': {
        title: 'Handlebars variant'
      }
    }
  },
  './src/data.hbs': {
    outDir: './functions/data',
    compile: {
      'data.yml': { external: true }
    }
  }
};
