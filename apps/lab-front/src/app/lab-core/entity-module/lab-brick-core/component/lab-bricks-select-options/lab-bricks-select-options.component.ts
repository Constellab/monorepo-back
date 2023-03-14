import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {LabBrickService} from '../../../../entity-service/lab-brick.service';
import {Observable} from 'rxjs';
import {LabBrickEntity} from '../../../../model/entities/lab-brick.entity';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'lab-bricks-select-options',
  templateUrl: './lab-bricks-select-options.component.html',
  styleUrls: ['./lab-bricks-select-options.component.scss']
})
export class LabBricksSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  bricks$: Observable<LabBrickEntity[]>;

  constructor(@Host() @Optional() private select: MatSelect,
              private brickService: LabBrickService) {
    super(select);
  }

  ngOnInit(): void {
    this.bricks$ = this.brickService.getAllBricks();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
