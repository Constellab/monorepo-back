import {FlErrorRequiredPipe} from './fl-error-required.pipe';

describe('ErrorRequiredPipe', () => {
  it('create an instance', () => {
    const pipe = new FlErrorRequiredPipe(null);
    expect(pipe).toBeTruthy();
  });
});
