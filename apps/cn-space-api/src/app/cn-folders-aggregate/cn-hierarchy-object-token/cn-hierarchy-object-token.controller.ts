import { BlParsePipe } from '@monorepo/back-core-lib';
import { ClPageI } from '@monorepo/core-lib';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectTokenDTO, CnHierarchyObjectTokenSaveDTO } from './cn-hierarchy-object-token.dto';
import { CnHierarchyObjectTokenAggregateService } from './cn-hierarchy-object-token-aggregate.service';
import { CnHierarchyObjectTokenDecorator } from './cn-hierarchy-object-token-guard.decorator';

@Controller('hierarchy-object-tokens')
export class CnHierarchyObjectTokenController {
  constructor(private hierarchyObjectTokenAggregateService: CnHierarchyObjectTokenAggregateService) {}

  @CnHierarchyObjectTokenDecorator()
  @Get('token/:token')
  getHierarchyObject(): CnHierarchyObject {
    return this.hierarchyObjectTokenAggregateService.getHierarchyObjectByAccessToken();
  }

  /////////////////////////////////////// TOKEN MANAGEMENT ///////////////////////////////////////

  @Post(':hierarchyObjectId')
  createAccessToken(
    @Param('hierarchyObjectId', ParseUUIDPipe) hierarchyObjectId: string,
    @Body(new BlParsePipe(CnHierarchyObjectTokenSaveDTO)) saveDTO: CnHierarchyObjectTokenSaveDTO
  ): Promise<CnHierarchyObjectTokenSaveDTO> {
    return this.hierarchyObjectTokenAggregateService.createAccessToken(hierarchyObjectId, saveDTO);
  }

  @Put(':accessTokenId')
  updateAccessToken(
    @Param('accessTokenId', ParseUUIDPipe) accessTokenId: string,
    @Body(new BlParsePipe(CnHierarchyObjectTokenSaveDTO)) saveDTO: CnHierarchyObjectTokenSaveDTO
  ): Promise<CnHierarchyObjectTokenSaveDTO> {
    return this.hierarchyObjectTokenAggregateService.updateAccessToken(accessTokenId, saveDTO);
  }

  @Delete(':accessTokenId')
  deleteAccessToken(@Param('accessTokenId', ParseUUIDPipe) accessTokenId: string): Promise<void> {
    return this.hierarchyObjectTokenAggregateService.deleteAccessToken(accessTokenId);
  }

  @Get('hierarchy-object/:hierarchyObjectId')
  findByHierarchyObjectId(
    @Param('hierarchyObjectId', ParseUUIDPipe) hierarchyObjectId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPageI<CnHierarchyObjectTokenDTO>> {
    return this.hierarchyObjectTokenAggregateService.findByHierarchyObjectId(hierarchyObjectId, page, size);
  }
}
