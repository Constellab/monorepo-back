import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { CnLabGuard } from '../cn-core/decorators/cn-lab-guard.decorator';
import { CnFrontService } from '../cn-core/services/cn-front.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnDocumentAggregateService } from '../cn-folders-aggregate/cn-documents/cn-document-aggregate.service';

/**
 * Specific controller for route called by a external datahub (lab)
 */
@CnLabGuard()
@Controller('external-datahub')
export class CnExternalDatahubController {
  constructor(
    private documentAggregateService: CnDocumentAggregateService,
    private frontService: CnFrontService
  ) {}

  @BlPublic()
  @Get('document/redirect/:filename')
  async redirectToDocumentUrl(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    const document = await this.documentAggregateService.findDocumentByFilename(filename);

    if (!document) {
      res.status(404).send('Document not found or no object URL available');
      return;
    }

    const docUrl = this.frontService.getDocumentUrl(
      CnCurrentUserHelper.getAndCheckCurrentSpace().domain,
      document.filename
    );

    res.redirect(docUrl);
  }
}
