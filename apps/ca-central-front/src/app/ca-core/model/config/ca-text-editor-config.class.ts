import {
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader, FlTextEditorSnowButton,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {CaReportService} from '../../service-api/ca-report.service';
import {RvResourceView} from '@monorepo/resource-view';
import {Observable} from 'rxjs';

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

  public getView(filename: string): Observable<RvResourceView> {
    return this.reportService.getView(this.reportId, filename);
  }

  onPasteImage(imgFile: File, state: FlTextEditorState): any {
    return null;
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [];
  }
}
