import { Module } from '@nestjs/common';
import { HnUserService } from './hn-user.service';
import { HnUserController } from './hn-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnUser } from './hn-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnUser])],
  exports: [TypeOrmModule, HnUserService],
  controllers: [HnUserController],
  providers: [HnUserService]
})
export class HnUserModule {}
