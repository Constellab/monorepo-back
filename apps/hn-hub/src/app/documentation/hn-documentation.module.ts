import {Module} from '@nestjs/common';
import {HnDocumentationService} from './hn-documentation.service';
import {HnDocumentationController} from './hn-documentation.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnDocumentation} from './hn-documentation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnDocumentation])],
  exports: [TypeOrmModule],
  controllers: [HnDocumentationController],
  providers: [HnDocumentationService]
})
export class HnDocumentationModule {
}
