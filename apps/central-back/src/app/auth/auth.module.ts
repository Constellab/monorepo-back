import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UsersModule} from '../users/users.module';
import {AuthController} from './auth.controller';
import {CoreModule} from '../core/core.module';


@Module({
  imports: [
    UsersModule,
    CoreModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {
}
