import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { HnDifyCreateDocumentDto, HnDifyCreateDocumentOptionsDto } from './hn-dify.dto';
import { HnDifyService } from './hn-dify.service';

@IsAdmin()
@Controller('dify')
export class HnDifyController {
  constructor(private readonly difyService: HnDifyService) {}

  @Get('list')
  async getKnowledgeBaseList(): Promise<any> {
    return await this.difyService.getKnowledgeBaseList();
  }

  @Post(['documents/:knowledgeBaseId/:entityType/:entityId', 'documents/:knowledgeBaseId/:entityType'])
  async createBrickDocsDocuments(
    @Param('knowledgeBaseId') knowledgeBaseId: string,
    @Param('entityType') entityType: HnEntityType,
    @Param('entityId') entityId: string = null,
    @Body() options: HnDifyCreateDocumentOptionsDto
  ): Promise<boolean> {
    const dto: HnDifyCreateDocumentDto = {
      entityType: entityType,
      entityId: entityId,
      knowledgeBaseId: knowledgeBaseId,
      options: options,
    };
    return await this.difyService.createDocuments(dto);
  }

  @Post()
  async createDocument(@Body() dto: HnDifyCreateDocumentDto): Promise<any> {
    return await this.difyService.createDocument(dto);
  }
}
