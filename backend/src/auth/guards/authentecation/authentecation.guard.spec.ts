import { AuthentecationGuard } from './authentecation.guard.js';

describe('AuthentecationGuard', () => {
  it('should be defined', () => {
    expect(new AuthentecationGuard()).toBeDefined();
  });
});
