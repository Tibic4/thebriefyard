import { describe, expect, it } from 'vitest';

import { fillTemplate } from '../src/template.js';

describe('fillTemplate', () => {
  it('substitutes a single placeholder', () => {
    expect(fillTemplate('Hello {{name}}', { name: 'world' })).toBe('Hello world');
  });

  it('substitutes multiple', () => {
    expect(fillTemplate('{{a}} and {{b}}', { a: 'x', b: 'y' })).toBe('x and y');
  });

  it('throws on a missing slot', () => {
    expect(() => fillTemplate('Hello {{missing}}', {})).toThrow(/missing/);
  });

  it('leaves non-placeholder braces alone', () => {
    expect(fillTemplate('a { b } c', {})).toBe('a { b } c');
  });

  it('handles hyphenated slot names', () => {
    expect(fillTemplate('{{name-core}}', { 'name-core': 'Sundial' })).toBe('Sundial');
  });
});
