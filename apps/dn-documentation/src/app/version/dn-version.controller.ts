import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ParsePipe } from '../core/pipes/parse.pipe';
import { Version } from './dn-version.entity';
import { VersionService } from './dn-version.service';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}
}
