import {Module} from '@nestjs/common';
import {CoreConfigModule} from './modules/core-config/core-config.module';
import {RequestContextModule} from './modules/request-context/request-context.module';
import {TranslateModule} from './modules/translate/translate.module';
import {MailService} from './services/mail/mail.service';
import {TokenService} from './services/token/token.service';
import {FrontService} from './services/front/front.service';

/**
 * Core module of the app, export all modules
 * required by the app
 */
@Module({
  imports: [
    CoreConfigModule,
    RequestContextModule,
    TranslateModule,
  ],
  providers: [
    MailService,
    TokenService,
    FrontService,
  ],
  exports: [
    CoreConfigModule,
    RequestContextModule,
    TranslateModule,

    // Providers
    MailService,
    TokenService,
    FrontService,
  ]
})
export class CoreModule {

}
