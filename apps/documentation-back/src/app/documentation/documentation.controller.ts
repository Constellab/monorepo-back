import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import {ParsePipe} from '../core/pipes/parse.pipe';
import { Documentation } from './documentation.entity';
import { DocumentationService } from './documentation.service';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post()
  create(@Body(new ParsePipe(Documentation)) createDocumentation: Documentation) {
    return this.documentationService.create(createDocumentation);
  }

  @Get()
  findAll() {
    return this.documentationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ParsePipe(Documentation)) updateDocumentation: Documentation) {
    return this.documentationService.update(id, updateDocumentation);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentationService.remove(id);
  }
}
