import { describe, it, expect } from 'vitest';
import hbs from '../src/index.js';
import path from 'path';

describe('vite-plugin-hbs', () => {
  it('should return a Vite plugin object', () => {
    const plugin = hbs({});
    expect(plugin.name).toBe('handlebars-parser');
    expect(typeof plugin.buildStart).toBe('function');
    expect(typeof plugin.transform).toBe('function');
    expect(typeof plugin.handleHotUpdate).toBe('function');
  });

  it('should validate configuration', () => {
    expect(() => hbs(null)).toThrow('[vite-plugin-hbs] Plugin config must be a plain object');
    expect(() => hbs({ 'file.hbs': 'not an object' })).toThrow(
      '[vite-plugin-hbs] Config entry for "file.hbs" must be a plain object.'
    );
    expect(() => hbs({ 'file.hbs': { outDir: 123 } })).toThrow(
      '[vite-plugin-hbs] "outDir" for "file.hbs" must be a string.'
    );
  });

  it('should transform .hbs files', () => {
    const plugin = hbs({});
    const src = '<div>{{title}}</div>';
    const id = 'test.hbs';

    // transform is a function in the returned object
    const result = plugin.transform(src, id);

    expect(result).toBeDefined();
    expect(result.code).toContain("import Handlebars from 'handlebars'");
    expect(result.code).toContain('handlebars.compile');
    expect(result.code).toContain('<div>{{title}}</div>');
  });

  it('should handle index.html transformation', () => {
    const plugin = hbs({});
    const html = '<html><body>{{title}}</body></html>';
    // Using an absolute path to avoid instance.js resolve issues if needed
    const filename = path.resolve('index.html');

    const result = plugin.transformIndexHtml.transform(html, { filename });

    expect(typeof result).toBe('string');
    expect(result).toContain('<html><body>');
  });
});
