import { CONFIG } from '../src/config';

describe('CIRO Mobile App Configuration', () => {
  it('should have a defined API_BASE_URL', () => {
    expect(CONFIG.API_BASE_URL).toBeDefined();
    expect(typeof CONFIG.API_BASE_URL).toBe('string');
    expect(CONFIG.API_BASE_URL.startsWith('http')).toBe(true);
  });

  it('should have a boolean DEMO_MODE flag', () => {
    expect(CONFIG.DEMO_MODE).toBeDefined();
    expect(typeof CONFIG.DEMO_MODE).toBe('boolean');
  });

  it('should have a reasonable REFRESH_INTERVAL greater than zero', () => {
    expect(CONFIG.REFRESH_INTERVAL).toBeDefined();
    expect(typeof CONFIG.REFRESH_INTERVAL).toBe('number');
    expect(CONFIG.REFRESH_INTERVAL).toBeGreaterThan(0);
  });
});
