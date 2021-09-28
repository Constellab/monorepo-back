import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ParsePipe } from '../core/pipes/parse.pipe';
import { Version } from './dn-version.entity';
import { VersionService } from './dn-version.service';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  // @Post()
  // create(@Body(new ParsePipe(Version)) createVersion: Version): Promise<Version> {
  //   return this.versionService.create(createVersion);
  // }

  // @Get()
  // findAll(): Promise<Version[]> {
  //   return this.versionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string): Promise<Version> {
  //   return this.versionService.findOne(id);
  // }

  // @Put()
  // update(@Body(new ParsePipe(Version)) updateVersion: Version): Promise<Version> {
  //   return this.versionService.update(updateVersion);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string): Promise<void> {
  //   return this.versionService.remove(id);
  // }
}
