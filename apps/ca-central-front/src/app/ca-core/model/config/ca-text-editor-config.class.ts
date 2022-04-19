import {Injectable} from '@angular/core';
import {
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader
} from '@monorepo/front-core-lib';
import {CaReportService} from '../../service-api/ca-report.service';

/**
 * Config for the text editor in the report
 */
@Injectable()
export class CaTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  constructor(private reportService: CaReportService) {
    super();
  }

  getToolbarConfig(): any {
    return FlQuillConfig.completeToolbarConfig;
  }

  getBlockAddButtons(): FlTextEditorBlockAddButton[] {
    return [];
  }


  public getImageUrl(filename: string): string {
    return this.reportService.getImageUrl(filename);
  }
}
