import {Module} from '@nestjs/common';
import {HnDocumentationService} from './hn-documentation.service';
import {HnDocumentationController} from './hn-documentation.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnDocumentation} from './hn-documentation.entity';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnDocumentation]), HnCoreModule],
  exports: [TypeOrmModule],
  controllers: [HnDocumentationController],
  providers: [HnDocumentationService]
})
export class HnDocumentationModule {
}
