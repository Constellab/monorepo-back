import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnUserEntity } from '../cn-users/cn-user.entity';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnAuthController } from './cn-auth.controller';
import { CnAuthService } from './cn-auth.service';
import { CnUser2FA } from './cn-user-2-f-a/cn-user-2-f-a.entity';
import { CnUser2FAService } from './cn-user-2-f-a/cn-user-2-f-a.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnUser2FA, CnUserEntity]), CnUsersModule],
  providers: [CnAuthService, CnUser2FAService],
  controllers: [CnAuthController],
  exports: [CnAuthService],
})
export class CnAuthModule {}
