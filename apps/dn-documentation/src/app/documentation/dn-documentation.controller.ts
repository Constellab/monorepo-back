import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ParsePipe } from '../core/pipes/dn-parse.pipe';
import {DnDocumentation, DnDocumentationDTO} from './dn-documentation.entity';
import { DnDocumentationService } from './dn-documentation.service';

@Controller('documentation')
export class DnDocumentationController {
  constructor(private readonly documentationService: DnDocumentationService) {}

  @Post()
  create(@Body(new ParsePipe(DnDocumentation)) createDocumentation: DnDocumentation): Promise<DnDocumentation> {
    return this.documentationService.create(createDocumentation);
  }

  @Get()
  async findAll(): Promise<DnDocumentationDTO[]> {
    const docs = await this.documentationService.findAll();
    return docs.map(doc => new DnDocumentationDTO(doc));
  }

  @Get('path')
  findOneByPath(@Query() query: any): Promise<DnDocumentation> {
    return this.documentationService.findOneByPath(query.path);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DnDocumentation> {
    return this.documentationService.findOne(id);
  }

  @Put()
  update(@Body(new ParsePipe(DnDocumentation)) updateDocumentation: DnDocumentation): Promise<DnDocumentation> {
    return this.documentationService.update(updateDocumentation);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }
}
