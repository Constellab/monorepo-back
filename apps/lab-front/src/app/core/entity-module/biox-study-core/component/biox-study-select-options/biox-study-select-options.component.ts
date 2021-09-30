import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {Observable} from 'rxjs';
import {BioxStudy} from '../../../../model/entities/biox-study.class';
import {BioxStudyService} from '../../../../entity-service/biox-study.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

/**
 * Component to place under a mat-select to show the list of studies
 */
@Component({
  selector: 'gen-biox-study-select-options',
  templateUrl: './biox-study-select-options.component.html',
  styleUrls: ['./biox-study-select-options.component.scss']
})
export class BioxStudySelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  studies$: Observable<BioxStudy[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private studyService: BioxStudyService) {
    super(select);
  }

  ngOnInit(): void {
    this.studies$ = this.studyService.getStudies();
    this.overrideCompareWithOnIds(this.select);
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
