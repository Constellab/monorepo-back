import {Module} from '@nestjs/common';
import {DnDocumentationService} from './dn-documentation.service';
import {DnDocumentationController} from './dn-documentation.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DnDocumentation} from './dn-documentation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnDocumentation])],
  exports: [TypeOrmModule],
  controllers: [DnDocumentationController],
  providers: [DnDocumentationService]
})
export class DnDocumentationModule {
}
