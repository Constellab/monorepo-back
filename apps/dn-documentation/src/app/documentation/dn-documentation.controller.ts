import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ParsePipe } from '../core/pipes/parse.pipe';
import { Documentation } from './dn-documentation.entity';
import { DocumentationService } from './dn-documentation.service';

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

  @Put()
  update(@Body(new ParsePipe(Documentation)) updateDocumentation: Documentation) {
    return this.documentationService.update(updateDocumentation);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentationService.remove(id);
  }
}
