import { Module } from '@nestjs/common';
import { VersionService } from './dn-version.service';
import { VersionController } from './dn-version.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Version } from './dn-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Version])],
  exports: [TypeOrmModule],
  controllers: [VersionController],
  providers: [VersionService]
})
export class VersionModule {}
