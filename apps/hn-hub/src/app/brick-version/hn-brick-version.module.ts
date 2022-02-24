import {Module} from '@nestjs/common';
import {HnBrickVersionService} from './hn-brick-version.service';
import {HnBrickVersionController} from './hn-brick-version.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrickVersion} from './hn-brick-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickVersion])],
  exports: [TypeOrmModule],
  controllers: [HnBrickVersionController],
  providers: [HnBrickVersionService]
})
export class HnBrickVersionModule {
}
