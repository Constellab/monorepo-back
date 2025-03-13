import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HnDifyService } from './hn-dify.service';
import { HnDifyCreateDocumentDto } from './hn-dify.dto';
import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';

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
    @Param('entityId') entityId: string = null
  ): Promise<boolean> {
    return await this.difyService.createDocuments(knowledgeBaseId, entityType, entityId);
  }

  @Post()
  async createDocument(@Body() dto: HnDifyCreateDocumentDto): Promise<any> {
    return await this.difyService.createDocument(dto);
  }
}
