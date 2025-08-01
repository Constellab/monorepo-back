import { PipeTransform } from '@nestjs/common';

import { TeRichText, TeRichTextInput } from './lib';

export class TeRichTextPipe implements PipeTransform {
  constructor() {}

  transform(value: TeRichTextInput): TeRichText {
    return new TeRichText(value);
  }
}
