import {Body, Controller, Get, Param, Post, Put, Req, UseGuards} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnDocumentation, HnDocumentationSearchDTO} from '../documentation/hn-documentation.entity';
import {HnNode} from '../folder/hn-folder.dto';
import {
  HnBrickListDTO,
  HnBrickVersionDownloadDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {Request} from 'express';

@Controller('brick')
@UseGuards(HnIsAdminGuard)
export class HnBrickController {
  constructor(private readonly brickService: HnBrickService) {
  }

  @BlPublic()
  @Get()
  find(): Promise<HnBrickListDTO[]> {
    return this.brickService.find();
  }

  @BlPublic()
  @Get('name/:name')
  findOneByName(@Param('name') name: string): Promise<HnBrick> {
    return this.brickService.findByName(name);
  }

  /**
   * Special route that is called by the lab using the central API key to retrieve info about the brick.
   * If the key is present and valid, private bricks can be accessed.
   */
  @BlPublic()
  @Get('central/name/:name/:version')
  findOneByNameCentral(@Param('name') name: string,
                        @Param('version') version: string,
                       @Req() request: Request): Promise<HnBrickVersionDownloadDTO> {
    return this.brickService.findByNameCentral(name, version, request.header('X-Api-Key'));
  }

  @BlPublic()
  @Get('docs/:brickId/:version')
  async findDocsByBrick(@Param('brickId') brickId: string, @Param('version') version: string): Promise<HnNode> {
    return this.brickService.findDocsByBrickAndVersion(await this.brickService.findById(brickId), version);
  }

  @BlPublic()
  @Get('root-folder/:brickId/:version')
  async findRootFolderId(@Param('brickId') brickId: string, @Param('version') version: string): Promise<{
    id: string
  }> {
    const id: string = await this.brickService.findRootFolderId(await this.brickService.findById(brickId), version);
    return {id: id};
  }

  @BlPublic()
  @Post('doc/:brickName/:version')
  async findCurrentDoc(@Param('brickName') brickName: string,
                       @Param('version') version: string,
                       @Body() body: any): Promise<HnDocumentation | any> {
    return this.brickService.findCurrentDoc(await this.brickService.findByName(brickName), body.path, version);
  }

  @BlPublic()
  @Get('first-doc/:brickName/:version')
  async findFirstDoc(@Param('brickName') brickName: string,
                     @Param('version') version: string): Promise<HnDocumentation> {
    return this.brickService.findFirstDoc(await this.brickService.findByName(brickName), version);
  }


  @IsAdmin()
  @Post()
  create(@Body(new BlParsePipe(HnCreateBrickDTO)) createBrick: HnCreateBrickDTO): Promise<HnBrick> {
    if (!createBrick.name.includes(' ')) {
      return this.brickService.create(createBrick);
    } else {
      return null;
    }
  }

  @IsAdmin()
  @Post('create-technical-doc')
  async createTechnicalDoc(@Body(new BlParsePipe(HnCreateTechnicalDocContent)) content: HnCreateTechnicalDocContent): Promise<boolean> {
    return this.brickService.createTechnicalDoc(content);
  }

  @BlPublic()
  @Get('technical-doc/:brickId/:version')
  async findTechnicalDoc(@Param('brickId') brickId: string, @Param('version') version: string): Promise<HnNode> {
    return this.brickService.findTechnicalDoc(await this.brickService.findById(brickId), version);
  }

  @BlPublic()
  @Post('technical-doc-by-path')
  async getTechDocByPath(@Body(new BlParsePipe(HnTechnicalDocInputDTO)) input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    return await this.brickService.findTechDoc(input);
  }

  @IsAdmin()
  @Post('new-version')
  createNewVersion(@Body(new BlParsePipe(HnNewVersionDTO)) newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    return this.brickService.createNewVersion(newVersion);
  }

  @BlPublic()
  @Get('latest/:brickName')
  public getLatestBrickVersion(@Param('brickName') brickName: string): Promise<HnBrickVersion> {
    return this.brickService.getLatestBrickVersion(brickName);
  }

  @IsAdmin()
  @Put('edit')
  public editBrick(@Body(new BlParsePipe(HnEditBrickDTO)) editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    return this.brickService.editBrick(editedBrick);
  }

  @IsAdmin()
  @Post('is-actual-brick-and-new-version')
  async isActualBrickAndNewVersion(
    @Body(new BlParsePipe(HnIsActualBrickAndNewVersionDTO))
      content: HnIsActualBrickAndNewVersionDTO
  ): Promise<[boolean, boolean]> {
    return this.brickService.isActualBrickAndNewVersion(content);
  }

  @Get('get-docs-by-name/:brickName/:major')
  async getDocsByBrickNameMajor(
    @Param('brickName') brickName: string,
    @Param('major') major: string): Promise<HnDocumentationSearchDTO[]> {

    return this.brickService.getDocsByBrickNameMajor(
      brickName,
      major === 'latest' ? (await this.getLatestBrickVersion(brickName)).version.major : +(major.slice(1)));
  }

  @Post('get-doc-by-link')
  async getDocByLink(@Body() body: any): Promise<HnDocumentationSearchDTO> {
    return this.brickService.getDocByLink(body.link);
  }
}
