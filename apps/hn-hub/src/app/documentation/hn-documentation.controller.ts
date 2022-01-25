import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {HnDocumentation, HnDocumentationContentDTO, HnDocumentationDTO} from './hn-documentation.entity';
import {HnDocumentationService} from './hn-documentation.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnNodeDTO} from '../folder/hn-folder.entity';

@Controller('documentation')
export class HnDocumentationController {
  constructor(private readonly documentationService: HnDocumentationService) {
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<HnDocumentationDTO[]> {
    return await this.documentationService.findAll();
  }

  @Put('content/:id')
  async updateContent(@Param('id') id: string,
                      @Body() updateContentDoc: Record<string, any>): Promise<HnDocumentation> {
    return await this.documentationService.updateContent(id, updateContentDoc);
  }

  @BlPublic()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HnDocumentation> {
    return await this.documentationService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }

  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    return this.documentationService.update(updatedDoc);
  }
}
