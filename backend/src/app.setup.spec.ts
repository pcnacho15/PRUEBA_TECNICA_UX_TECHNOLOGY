import { resolveCorsOrigin } from './app.setup.js';

describe('resolveCorsOrigin', () => {
  it('permite cualquier origen si la variable no está definida o está vacía', () => {
    expect(resolveCorsOrigin(undefined)).toBe(true);
    expect(resolveCorsOrigin('  ,  ')).toBe(true);
  });

  it('devuelve la lista de orígenes sin espacios ni barra final', () => {
    expect(
      resolveCorsOrigin(' https://app.vercel.app/ , http://localhost:5173'),
    ).toEqual(['https://app.vercel.app', 'http://localhost:5173']);
  });
});
