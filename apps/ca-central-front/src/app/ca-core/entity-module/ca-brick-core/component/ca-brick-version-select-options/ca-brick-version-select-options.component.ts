import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {Observable} from 'rxjs';
import {CaBrickVersion} from '../../../../model/entities/ca-brick.class';
import {CaBrickService} from '../../../../service-api/ca-brick.service';

@Component({
  selector: 'ca-brick-version-select-options',
  templateUrl: './ca-brick-version-select-options.component.html',
  styleUrls: ['./ca-brick-version-select-options.component.scss']
})
export class CaBrickVersionSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  @Input() brickName: string;

  versions$: Observable<CaBrickVersion[]>;

  constructor(@Host() private select: MatSelect,
              private brickService: CaBrickService) {
    super(select);
  }

  ngOnInit(): void {
    if (this.brickName == null) {
      console.error('[CaBrickVersionSelectOptionsComponent] no brick name provided');
    }
    this.overrideCompareWithOnIds(this.select);
    this.versions$ = this.brickService.getBrickVersions(this.brickName);
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
