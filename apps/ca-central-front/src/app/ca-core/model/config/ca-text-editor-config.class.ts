import {
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorSnowButton
} from '@monorepo/front-core-lib';
import {CaReportService} from '../../service-api/ca-report.service';
import {Observable} from 'rxjs';
import {CaResourceView} from '../entities/ca-report.class';

/**
 * Config for the text editor in the report
 */
export class CaTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  constructor(private reportService: CaReportService, private reportId: string) {
    super();
  }

  getToolbarConfig(): any {
    return FlQuillConfig.completeToolbarConfig;
  }

  getBlockAddButtons(): FlTextEditorBlockAddButton[] {
    return [];
  }


  public getImageUrl(filename: string): string {
    return this.reportService.getImageUrl(this.reportId, filename);
  }

  public getView(filename: string): Observable<CaResourceView> {
    return this.reportService.getView(this.reportId, filename);
  }

  onPasteImage(): any {
    return null;
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [];
  }
}
