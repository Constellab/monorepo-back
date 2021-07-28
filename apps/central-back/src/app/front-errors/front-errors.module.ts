import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {FrontError} from './front-error.entity';
import {CoreModule} from '../core/core.module';
import {FrontErrorsController} from './front-errors.controller';
import {FrontErrorsService} from './front-errors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FrontError]),

    CoreModule,

  ],
  controllers: [FrontErrorsController],
  providers: [FrontErrorsService]
})
export class FrontErrorsModule {
}
