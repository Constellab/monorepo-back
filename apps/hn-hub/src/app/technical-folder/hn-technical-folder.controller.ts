import {Controller,} from '@nestjs/common';
import {HnTechnicalFolderService} from './hn-technical-folder.service';

@Controller('hn-technical-folder')
export class HnTechnicalFolderController {
  constructor(
    private readonly TechnicalFolderService: HnTechnicalFolderService
  ) {
  }
}
