import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ParsePipe } from '../core/pipes/dn-parse.pipe';
import {DnUser} from './dn-user.entity';
import { DnUserService } from './dn-user.service';

@Controller('user')
export class DnUserController {
  constructor(private readonly userService: DnUserService) {}
}
