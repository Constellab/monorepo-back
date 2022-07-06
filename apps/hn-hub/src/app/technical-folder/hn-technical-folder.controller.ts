import {Controller, Post,} from '@nestjs/common';
import {HnTechnicalFolderService} from './hn-technical-folder.service';

@Controller('technical-folder')
export class HnTechnicalFolderController {
  constructor(
    private readonly TechnicalFolderService: HnTechnicalFolderService
  ) {
  }
  
}
