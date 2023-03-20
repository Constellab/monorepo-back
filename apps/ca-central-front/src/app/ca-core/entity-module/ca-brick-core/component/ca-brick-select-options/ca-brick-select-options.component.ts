import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaBrick} from '../../../../model/entities/ca-brick.class';
import {CaBrickService} from '../../../../service-api/ca-brick.service';
import {MatSelect} from '@angular/material/select';

/**
 * Select options of all brick and use name as value
 */
@Component({
  selector: 'ca-brick-select-options',
  templateUrl: './ca-brick-select-options.component.html',
  styleUrls: ['./ca-brick-select-options.component.scss']
})
export class CaBrickSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {


  bricks$: Observable<CaBrick[]>;

  constructor(@Host() private select: MatSelect,
              private brickService: CaBrickService) {
    super(select);
  }

  ngOnInit(): void {
    this.bricks$ = this.brickService.getAll();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
