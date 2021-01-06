import {ErrorRequiredPipe} from './error-required.pipe';

describe('ErrorRequiredPipe', () => {
  it('create an instance', () => {
    const pipe = new ErrorRequiredPipe(null);
    expect(pipe).toBeTruthy();
  });
});
