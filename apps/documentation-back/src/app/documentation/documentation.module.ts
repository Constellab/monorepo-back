import { Module } from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentation } from './documentation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Documentation])],
  exports: [TypeOrmModule],
  controllers: [DocumentationController],
  providers: [DocumentationService]
})
export class DocumentationModule {}
