# vite-plugin-hbs

A fast and highly configurable Handlebars template engine plugin for [Vite](https://vitejs.dev/).

This plugin processes `.hbs` files and HTML entry points through Handlebars at build time and during development with full Hot Module Replacement (HMR) support. It fully supports partials, custom helpers, data injection, inline JavaScript compilation, and generating multiple files from a single template source.

---

## Features

- **Seamless Vite Integration**: Compiles `.hbs` files imported into JavaScript modules directly into callable template functions.
- **HTML Transformation**: Enhances Vite's HTML compilation step using standard Handlebars context and partials.
- **Full HMR Support**: Live-reloads templates, partials, and helper modules automatically.
- **File Emission**: Easily output non-HTML formats (YAML, JSON, text) directly to the filesystem or as build assets.
- **Modern Architecture**: Written in ES Modules (`const` arrow functions, modern `fs` utilities) and well-tested with Vitest.

---

## Requirements

- **Node.js** >= 18.0.0
- **Vite** >= 4.0.0

---

## Installation

```bash
# npm
npm install -D vite-plugin-hbs

# yarn
yarn add -D vite-plugin-hbs

# pnpm
pnpm add -D vite-plugin-hbs
```

_Note: Handlebars is a peer dependency that comes bundled with the plugin; no separate Handlebars installation is required._

---

## Basic Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import hbs from 'vite-plugin-hbs';
import hbsConfig from './hbs.config.js';

export default defineConfig({
  plugins: [hbs(hbsConfig)],
});
```

The plugin is driven entirely by a plain JavaScript object (typically kept in a separate file, like `hbs.config.js`). Each key in the config object represents a source file (relative to the Vite root), and the value defines how Handlebars processes that file.

---

## `hbs.config.js` API

```js
// hbs.config.js
export default {
  // Key: path to the source file (relative to project root)
  './src/index.html': {
    partials: './src/partials/**',   // string or string[] glob
    helpers: { ... },                // object, string, or string[] glob
    data: { ... },                   // plain object — injected as template context
    compile: { ... },                // see "Compile: Generating Multiple Files" below
  },
  './src/data.hbs': {
    outDir: './functions/data',      // write output directly to the filesystem (dev + build)
    compile: {
      'config.yml': { env: 'production' }
    },
  },
};
```

### Options Reference

| Option     | Type                           | Description                                                                                                                                                                                      |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `partials` | `string \| string[]`           | Glob pattern(s) pointing to `.hbs` partial files. Each file's basename (without `.hbs`) becomes the registered partial name (e.g., `header.hbs` -> `{{> header}}`).                              |
| `helpers`  | `object \| string \| string[]` | Handlebars helpers. Provide an object of `{ name: function }` pairs, or a glob / array of globs pointing to JS modules exporting helper objects.                                                 |
| `data`     | `object`                       | Global data injected into the template as the Handlebars context.                                                                                                                                |
| `compile`  | `object`                       | A map defining multiple output files to render from this template. Keys are output filenames, values are data objects merged with the global `data`.                                             |
| `outDir`   | `string`                       | Outputs compiled files directly to the filesystem at this directory instead of adding them as Vite assets. Perfect for generating config files (YAML/JSON). Directory is cleared before writing. |

---

## Features Guide

### Partials

Place partial templates in a directory and point the `partials` glob at them.

```html
<!-- src/partials/header.hbs -->
<header>My Header</header>

<!-- src/index.html -->
{{> header}}
<main>Hello, {{title}}!</main>
```

```js
// hbs.config.js
export default {
  './src/index.html': {
    partials: './src/partials/**',
    data: { title: 'My Site' },
  },
};
```

### Helpers

**Inline Helpers (Plain Object):**

```js
// hbs.config.js
export default {
  './src/index.html': {
    helpers: {
      upper: (str) => str.toUpperCase(),
      concat: (a, b) => `${a} ${b}`,
    },
  },
};
```

**File-based Helpers (Glob):**
Organize complex helpers in their own ES modules.

```js
// src/helpers/string.js
export default {
  upper: (str) => str.toUpperCase(),
};
```

```js
// hbs.config.js
export default {
  './src/index.html': {
    helpers: './src/helpers/**', // Automatically resolves, imports, and registers
  },
};
```

### Context Data Injection

Pass any plain object as `data` to provide the Handlebars evaluation context.

```js
export default {
  './src/index.html': {
    data: {
      title: 'My App',
      version: '1.0.0',
    },
  },
};
```

### Compile: Generating Multiple Files

The `compile` option lets you render one single template into multiple different output files, merging specific extra data on top of the global `data`.

```js
// hbs.config.js
export default {
  './src/index.html': {
    data: { appName: 'My App' },
    compile: {
      'index.html': { lang: 'en', title: 'Home' },
      'es/index.html': { lang: 'es', title: 'Inicio' },
    },
  },
};
```

### Writing to the Filesystem with `outDir`

If you need to generate non-HTML files that other tools rely on (like serverless functions, database config YAMLs), use `outDir`.

```js
export default {
  './src/data.hbs': {
    outDir: './functions/data',
    compile: {
      'config.yml': { env: 'production' },
    },
  },
};
```

### Importing `.hbs` files as Modules in JavaScript

When a JavaScript module imports an `.hbs` file, the plugin automatically compiles it into a default-exported Handlebars function. It also embeds any partials and helpers defined for that file in the config.

```js
import greet from './greet.hbs';

// Render the template on the client
const html = greet({ name: 'World' });
document.getElementById('app').innerHTML = html;
```

---

## HMR / Dev Server

During development (`vite dev`), the plugin actively watches:

- Source `.hbs` and `.html` files.
- Glob-resolved partial directories.
- Glob-resolved helper modules.

When changes are detected, the plugin smartly recompiles only the affected instances and triggers a full page reload via Vite's WebSocket. **Zero manual configuration is required for HMR.**

---

## License

MIT
