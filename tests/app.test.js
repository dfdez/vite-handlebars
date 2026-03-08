import { describe, it, expect } from 'vitest';
import link from '../src/partials/link.hbs';
import title from '../src/partials/title.hbs';

describe('Vite App Templates', () => {
  it('should compile link.hbs correctly', () => {
    const result = link({ href: 'https://test.com', slot: 'Test Slot' });
    expect(result).toBe("<a href='https://test.com' target='_blank'>Test Slot</a>");
  });

  it('should compile title.hbs correctly', () => {
    const result = title({ slot: 'Test Title' });
    expect(result).toBe('<h1>Test Title</h1>');
  });

  it('should have a functional DOM environment', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = document.querySelector('#app');
    expect(app).toBeDefined();
    app.innerHTML = '<span>Hello</span>';
    expect(app.innerHTML).toBe('<span>Hello</span>');
  });
});
