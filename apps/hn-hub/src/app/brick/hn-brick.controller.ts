import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {HnBrickService} from './hn-brick.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnNode} from '../folder/hn-folder.dto';
import {
  HnBrickListDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';

@Controller('brick')
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

  @BlPublic()
  @Get('docs/:brickId/:version')
  async findDocsByBrick(@Param('brickId') brickId: string, @Param('version') version: string): Promise<HnNode> {
    return this.brickService.findDocsByBrickAndVersion(await this.brickService.findById(brickId), version);
  }

  @BlPublic()
  @Get('root-folder/:brickId/:version')
  async findRootFolderId(@Param('brickId') brickId: string, @Param('version') version: string): Promise<{ id: string }> {
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

  @Post()
  create(@Body(new BlParsePipe(HnCreateBrickDTO)) createBrick: HnCreateBrickDTO): Promise<HnBrick> {
    if (!createBrick.name.includes(' ')) {
      return this.brickService.create(createBrick);
    } else {
      return null;
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.brickService.deleteBrickById(id);
  }

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

  @Post('new-version')
  createNewVersion(@Body(new BlParsePipe(HnNewVersionDTO)) newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    return this.brickService.createNewVersion(newVersion);
  }

  @BlPublic()
  @Get('latest/:brickName')
  public getLatestBrickVersion(@Param('brickName') brickName: string): Promise<HnBrickVersion> {
    return this.brickService.getLatestBrickVersion(brickName);
  }

  @Put('edit')
  public editBrick(@Body(new BlParsePipe(HnEditBrickDTO)) editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    return this.brickService.editBrick(editedBrick);
  }

  @Post('is-actual-brick-and-new-version')
  async isActualBrickAndNewVersion(@Body(new BlParsePipe(HnIsActualBrickAndNewVersionDTO))
    content: HnIsActualBrickAndNewVersionDTO): Promise<[boolean, boolean]> {
    return this.brickService.isActualBrickAndNewVersion(content);
  }
}
