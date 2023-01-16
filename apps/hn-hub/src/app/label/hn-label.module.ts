import {Module} from '@nestjs/common';
import {HnLabelService} from './hn-label.service';
import {HnLabelController} from './hn-label.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLabel} from './hn-label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnLabel])],
  exports: [TypeOrmModule],
  controllers: [HnLabelController],
  providers: [HnLabelService],
})
export class HnLabelModule {
}
