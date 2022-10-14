import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {RvResourceView} from '@monorepo/resource-view';
import {CaReportViewConfig} from '../../model/ca-report-content-view.class';
import {FlTextEditorElementDirective, FlTextEditorsManagerState} from '@monorepo/front-core-lib';
import {CaTextEditorConfig} from '../../../../../ca-core/model/config/ca-text-editor-config.class';

@Component({
  selector: 'ca-report-content-view',
  templateUrl: './ca-report-content-view.component.html',
  styleUrls: ['./ca-report-content-view.component.scss']
})
export class CaReportContentViewComponent extends FlTextEditorElementDirective implements OnInit {

  @Input() viewConfig: CaReportViewConfig;

  view$: Observable<RvResourceView>;

  private config: CaTextEditorConfig;

  constructor(elementRef: ElementRef<HTMLElement>,
              managersState: FlTextEditorsManagerState) {
    super(elementRef, managersState);
    this.config = this.state.config as any;
  }

  ngOnInit(): void {
    this.view$ = this.config.getView(this.viewConfig.filename);
  };

}
