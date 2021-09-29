import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { pathToFileURL } from 'url';
import { ParsePipe } from '../core/pipes/parse.pipe';
import { Documentation } from './dn-documentation.entity';
import { DocumentationService } from './dn-documentation.service';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post()
  create(@Body(new ParsePipe(Documentation)) createDocumentation: Documentation): Promise<Documentation> {
    return this.documentationService.create(createDocumentation);
  }

  @Get()
  findAll(): Promise<Documentation[]> {
    return this.documentationService.findAll();
  }

  @Get('path')
  findOneByPath(@Query() query: any): Promise<Documentation> {
    return this.documentationService.findOneByPath(query.path);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Documentation> {
    return this.documentationService.findOne(id);
  }

  @Put()
  update(@Body(new ParsePipe(Documentation)) updateDocumentation: Documentation): Promise<Documentation> {
    return this.documentationService.update(updateDocumentation);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }
}
