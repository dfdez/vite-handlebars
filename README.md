# vite-handlebars

This repository serves as both the home for the `vite-plugin-hbs` plugin and a functional Vite demo application demonstrating its capabilities.

## Repository Structure

- **[`plugins/vite-plugin-hbs/`](./plugins/vite-plugin-hbs/)** — The Handlebars template engine plugin for Vite. It handles `.hbs` imports, `index.html` transformations, partials, helpers, and file emissions.
- **[`src/`](./src/)** — A minimal Vite project that exercises the plugin, showcasing HTML templating, `.hbs` module imports, inline helpers, data injection, and multi-file compilation.

For full documentation on the plugin (installation, configuration, options, and HMR behavior), please see the **[Plugin README](./plugins/vite-plugin-hbs/README.md)**.

---

## Demo App

The demo application illustrates how to configure and use the plugin in a real-world scenario.

### Key Files

- `src/index.html` — The main HTML entry point rendered through Handlebars, demonstrating partials (`{{> title}}`) and inline helpers (`concat`).
- `src/partials/` — A directory containing partial templates (`title.hbs`, `link.hbs`) automatically registered by the plugin.
- `src/data.hbs` — A non-HTML template configured to output valid YAML to `functions/data/data.yml` using the `outDir` option.
- `src/main.js` — Demonstrates importing a `.hbs` file directly as a JavaScript module and rendering it on the client side.
- `hbs.config.js` — The dedicated configuration file for the Handlebars plugin, defining contexts, helpers, and compile targets.
- `vite.config.js` — The standard Vite configuration that registers the plugin.

### Running the Demo

Make sure you have Node.js 18+ installed.

```bash
# Install dependencies (for both the demo app and the local plugin)
npm install

# Start the Vite dev server with full HMR support
npm run dev

# Create a production build (outputs to ../dist by default)
npm run build

# Preview the production build locally
npm run preview
```

### Code Quality & Testing

This project is fully configured with modern tooling:

- **Linting & Formatting**: Uses ESLint (Flat Config) and Prettier. Run `npm run lint` and `npm run format`.
- **Testing**: Uses Vitest and jsdom.
  - Run `npm test` in the root directory to test the compiled template outputs.
  - Run `npm test` inside `plugins/vite-plugin-hbs/` to run the plugin's unit tests.

---

## License

MIT
