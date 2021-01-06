import {Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query} from '@nestjs/common';
import {ProtocolsSecurityLayer} from './protocols-security-layer.service';
import {Protocol} from './protocol.entity';
import {ParsePipe} from '../core/pipes/parse.pipe';
import {Page} from '../core/model/config/page.class';

@Controller('protocols')
export class ProtocolsController {

  constructor(private securityLayer: ProtocolsSecurityLayer) {
  }

  @Get('current')
  getCurrentProtocols(@Query('page', ParseIntPipe) page: number,
                      @Query('size', ParseIntPipe) size: number): Promise<Page<Protocol>> {
    return this.securityLayer.getCurrentProtocols(page, size);
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Protocol> {
    return this.securityLayer.findByIdAndCheckSecure(id);
  }

  @Post()
  create(@Body(new ParsePipe(Protocol)) protocol: Protocol): Promise<Protocol> {
    return this.securityLayer.createSecure(protocol);
  }
}
