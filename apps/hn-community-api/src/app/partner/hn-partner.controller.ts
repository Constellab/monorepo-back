import {
  BlFile,
  BlOptionalAuth,
  BlParsePipe,
  BlSearchParams,
  BlSearchSortCriteria,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichText,
  TeRichTextPipe,
} from '@monorepo/te-text-editor';
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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnAbstractFileController } from '../file-aggregate/file-core/hn-abstract-file.controller';
import { HnFilePartnerService } from '../file-aggregate/file-partner/hn-file-partner.service';
import { HnEditPartnerDto, HnPartnerDetailDto, HnPartnerDto } from './hn-partner.dto';
import { HnPartner } from './hn-partner.entity';
import { HnPartnerService } from './hn-partner.service';

@Controller('partner')
export class HnPartnerController extends HnAbstractFileController<HnPartner> {
  constructor(
    private readonly partnerService: HnPartnerService,
    readonly filePartnerService: HnFilePartnerService
  ) {
    super(filePartnerService);
  }

  @BlOptionalAuth()
  @Get('all-map')
  findAllMap(): Promise<HnSitemapItemBase[]> {
    return this.partnerService.findAllMap();
  }

  @BlOptionalAuth()
  @Get('current')
  async getCurrentUserPartner(): Promise<HnPartnerDetailDto | null> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.getCurrentUserPartner());
  }

  @BlOptionalAuth()
  @Get('user/:userId')
  async getPartnerByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string
  ): Promise<HnPartnerDetailDto | null> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.findByUserId(userId));
  }

  @BlOptionalAuth()
  @Get(':id')
  async getPartnerById(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnPartnerDetailDto | null> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.findById(id));
  }

  @BlOptionalAuth()
  @Post('search')
  async search(
    @Body('nameFilter') nameFilter: string,
    @Body('sorts') sortsCriteria: BlSearchSortCriteria[],
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnPartnerDto>> {
    const partners = await this.partnerService.searchCertified(nameFilter, sortsCriteria, page, size);
    return partners.map((partner) => HnPartnerDto.fromEntity(partner));
  }

  @IsAdmin()
  @Post('search-for-admin')
  async searchForAdmin(
    @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnPartnerDto>> {
    const partners = await this.partnerService.searchForAdmin(searchParams, page, size);
    return partners.map((partner) => HnPartnerDto.fromEntity(partner));
  }

  @Post()
  async createPartnerForCurrentUser(@Body() createPartnerDto: HnEditPartnerDto): Promise<HnPartnerDetailDto> {
    return HnPartnerDetailDto.fromEntity(
      await this.partnerService.createCurrentUserPartner(createPartnerDto)
    );
  }

  @IsAdmin()
  @Post(':id')
  async createPartnerForUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnPartnerDetailDto> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.createPartnerForUser(id));
  }

  @IsAdmin()
  @Post(':id/certify')
  async certifyPartner(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnPartnerDetailDto> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.certifyPartner(id));
  }

  @IsAdmin()
  @Post(':id/decertify')
  async decertifyPartner(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnPartnerDetailDto> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.decertifyPartner(id));
  }

  @Put(':id')
  async updatePartner(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePartnerDto: HnEditPartnerDto
  ): Promise<HnPartnerDetailDto> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.updatePartner(id, updatePartnerDto));
  }

  @Put(':id/info')
  async updatePartnerInfo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(TeRichTextPipe) info: TeRichText
  ): Promise<HnPartnerDetailDto> {
    return HnPartnerDetailDto.fromEntity(await this.partnerService.updatePartnerInfo(id, info));
  }

  //////////////////////////////////////////// FILE ////////////////////////////////////////////

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:partnerId')
  saveFile(
    @BlUploadedFile() file: BlFile,
    @Param('partnerId', new ParseUUIDPipe()) partnerId: string
  ): Promise<TeBlockFileUploadResponse> {
    return this.partnerService.saveFile(file, partnerId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('image/:partnerId')
  async saveImage(
    @BlUploadedFile() file: BlFile,
    @Param('partnerId', new ParseUUIDPipe()) partnerId: string
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.partnerService.saveImage(file, partnerId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':partnerId/view')
  async saveResourceViewFile(
    @BlUploadedFile() file: BlFile,
    @Param('partnerId', new ParseUUIDPipe()) partnerId: string
  ): Promise<any> {
    return {
      filename: await this.partnerService.saveView(file, partnerId),
    };
  }

  ///////////////////////////// LOGO ////////////////////////////////

  @UseInterceptors(FileInterceptor('file'))
  @Post('logo/:partnerId')
  async saveLogo(
    @BlUploadedFile() file: BlFile,
    @Param('partnerId', new ParseUUIDPipe()) partnerId: string
  ): Promise<TeBlockFigureUploadedResponse> {
    const savedFile: TeBlockFigureUploadedResponse = await this.partnerService.saveImage(file, partnerId);
    await this.partnerService.updatePartnerLogo(partnerId, savedFile.filename);
    return savedFile;
  }

  @Delete(':entityId/logo/:name')
  async deleteLogo(
    @Param('entityId', new ParseUUIDPipe()) entityId: string,
    @Param('name') name: string
  ): Promise<void> {
    await this.fileService.deleteFile(entityId, name);
    await this.partnerService.deleteLogo(entityId);
  }
}
