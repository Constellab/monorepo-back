import { Module } from '@nestjs/common';
import { DocumentationService } from './dn-documentation.service';
import { DocumentationController } from './dn-documentation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentation } from './dn-documentation.entity';
import { VersionModule } from '../version/dn-version.module';
import { VersionService } from '../version/dn-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([Documentation]), VersionModule],
  exports: [TypeOrmModule],
  controllers: [DocumentationController],
  providers: [DocumentationService, VersionService]
})
export class DocumentationModule {}
