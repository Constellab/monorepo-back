import {Controller, Delete, Get, Param, Query} from '@nestjs/common';
import {DnDocumentation, DnDocumentationDTO} from './dn-documentation.entity';
import {DnDocumentationService} from './dn-documentation.service';
import {BlPublic} from '@monorepo/back-core-lib';

@Controller('documentation')
export class DnDocumentationController {
  constructor(private readonly documentationService: DnDocumentationService) {
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<DnDocumentationDTO[]> {
    return await this.documentationService.findAll();
  }

  @BlPublic()
  @Get('path')
  findOneByPath(@Query() query: any): Promise<DnDocumentation> {
    return this.documentationService.findOneByPath(query.path);
  }

  @BlPublic()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<DnDocumentation> {
    return this.documentationService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }
}
