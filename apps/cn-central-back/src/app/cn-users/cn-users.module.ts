import {Module} from '@nestjs/common';
import {CnUsersService} from './cn-users.service';
import {CnUsersController} from './cn-users.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnUser} from './cn-user.entity';
import {CnCoreModule} from '../cn-core/cn-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnUser]),

    CnCoreModule,
  ],
  providers: [CnUsersService],
  controllers: [CnUsersController],
  exports: [CnUsersService]
})
export class CnUsersModule {
}

