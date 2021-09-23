import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UsersModule} from '../users/users.module';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import {jwtConfig} from './jwt.config';
import {AuthController} from './auth.controller';
import {CoreConfigService} from '../core/modules/core-config/core-config.service';
import {JwtModuleOptions} from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import {CoreConfigModule} from '../core/modules/core-config/core-config.module';
import {CoreModule} from '../core/core.module';

function asyncRegister(coreConfigService: CoreConfigService): JwtModuleOptions {
  return {
    secret: coreConfigService.getJwtSecret(),
    signOptions: {expiresIn: jwtConfig.tokenDurationInSeconds}
  };
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: asyncRegister,
      inject: [CoreConfigService],
      imports: [CoreConfigModule]
    }),

    CoreModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {
}
