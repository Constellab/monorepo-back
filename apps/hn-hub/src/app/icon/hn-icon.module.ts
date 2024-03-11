import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnIcon} from './hn-icon.entity';
import {HnIconController} from './hn-icon.controller';
import {HnIconService} from './hn-icon.service';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnIcon]),
    HnCoreModule
  ],
  exports: [TypeOrmModule],
  controllers: [HnIconController],
  providers: [HnIconService],
})
export class HnIconModule {
}
