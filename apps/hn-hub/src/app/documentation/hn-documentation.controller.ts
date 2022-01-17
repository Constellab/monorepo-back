import {Body, Controller, Delete, Get, Param, Put, Query} from '@nestjs/common';
import {
  HnDocumentation,
  HnDocumentationContentDTO,
  HnDocumentationDTO,
  HnDocumentationResDTO
} from './hn-documentation.entity';
import {HnDocumentationService} from './hn-documentation.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';

@Controller('documentation')
export class HnDocumentationController {
  constructor(private readonly documentationService: HnDocumentationService) {
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<HnDocumentationDTO[]> {
    return await this.documentationService.findAll();
  }

  @Put('content')
  async updateContent(@Body(new BlParsePipe(HnDocumentationContentDTO)) updateContentDoc: HnDocumentationContentDTO): Promise<HnDocumentation> {
    return await this.documentationService.updateContent(updateContentDoc);
  }

  @BlPublic()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<HnDocumentation> {
    return this.documentationService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }
}
