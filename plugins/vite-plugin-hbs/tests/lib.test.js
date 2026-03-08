import { describe, it, expect } from 'vitest';
import { createInstanceObject } from '../src/lib/instance.js';
import { hbsRegisterHelpers } from '../src/lib/helpers.js';

describe('vite-plugin-hbs lib', () => {
  describe('instance', () => {
    it('should create an instance object', () => {
      const options = { data: { title: 'Test' } };
      const context = { rollup: {}, path: 'test.hbs' };
      const instance = createInstanceObject(options, context);

      expect(instance.data.title).toBe('Test');
      expect(instance.path).toBe('test.hbs');
      expect(instance.handlebars).toBeDefined();
      expect(instance.registered.helpers).toBeDefined();
    });
  });

  describe('helpers', () => {
    it('should register helpers', () => {
      const instance = createInstanceObject({}, { path: 'test.hbs' });
      const helpers = {
        testHelper: () => 'result',
      };

      hbsRegisterHelpers(instance, helpers);

      expect(instance.registered.helpers.testHelper).toBe(helpers.testHelper);
      // Handlebars internal check
      expect(instance.handlebars.helpers.testHelper).toBeDefined();
    });

    it('should throw error if helper is not a function', () => {
      const instance = createInstanceObject({}, { path: 'test.hbs' });
      const helpers = {
        testHelper: 'not a function',
      };

      expect(() => hbsRegisterHelpers(instance, helpers)).toThrow(
        '[vite-plugin-hbs] Helper "testHelper" must be a function'
      );
    });
  });
});
