import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ParsePipe } from '../core/pipes/dn-parse.pipe';
import { DnVersion } from './dn-version.entity';
import { DnVersionService } from './dn-version.service';

@Controller('version')
export class DnVersionController {
  constructor(private readonly versionService: DnVersionService) {}
}
