import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {DnDocumentation, DnDocumentationDTO} from './dn-documentation.entity';
import {DnDocumentationService} from './dn-documentation.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';

@Controller('documentation')
export class DnDocumentationController {
  constructor(private readonly documentationService: DnDocumentationService) {
  }

  @Post()
  create(@Body(new BlParsePipe(DnDocumentation)) createDocumentation: DnDocumentation): Promise<DnDocumentation> {
    return this.documentationService.create(createDocumentation);
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

  @Put()
  update(@Body(new BlParsePipe(DnDocumentation)) updateDocumentation: DnDocumentation): Promise<DnDocumentation> {
    return this.documentationService.update(updateDocumentation);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }
}
