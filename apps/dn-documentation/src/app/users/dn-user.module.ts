import { Module } from '@nestjs/common';
import { DnUserService } from './dn-user.service';
import { DnUserController } from './dn-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnUser } from './dn-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnUser])],
  exports: [TypeOrmModule, DnUserService],
  controllers: [DnUserController],
  providers: [DnUserService]
})
export class DnUserModule {}
