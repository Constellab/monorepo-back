import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { CnLabGuard } from '../cn-core/decorators/cn-lab-guard.decorator';
import { CnDocumentAggregateService } from '../cn-folders-aggregate/cn-documents/cn-document-aggregate.service';

/**
 * Specific controller for route called by a external datahub (lab)
 */
@CnLabGuard()
@Controller('external-datahub')
export class CnExternalDatahubController {
  private readonly logger = new Logger(CnExternalDatahubController.name);

  constructor(private documentAggregateService: CnDocumentAggregateService) {}

  @BlPublic()
  @Get('document/redirect/:filename')
  async redirectToDocumentUrl(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    try {
      const documentUrl = await this.documentAggregateService.findDocumentUrlByFilename(filename);
      res.redirect(documentUrl);
    } catch (error) {
      this.logger.error('Error fetching document URL from filename:', error);
      res.status(404).send('Document not found or no object URL available');
      return;
    }
  }
}
