import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnServerStandard } from './cn-server-standard.entity';
import { CnServerStandardService } from './cn-server-standard.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnServerStandard]), CnCoreModule],
  providers: [CnServerStandardService],
  exports: [CnServerStandardService],
})
export class CnServerStandardModule {}
