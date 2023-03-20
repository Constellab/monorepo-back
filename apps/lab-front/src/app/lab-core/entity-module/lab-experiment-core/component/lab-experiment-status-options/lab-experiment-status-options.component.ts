import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, FlStatus} from '@monorepo/front-core-lib';
import {labExperimentStatusDict} from '../../../../model/entities/lab-experiment.entity';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'lab-experiment-status-options',
  templateUrl: './lab-experiment-status-options.component.html',
  styleUrls: ['./lab-experiment-status-options.component.scss']
})
export class LabExperimentStatusOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  statusList: FlStatus[] = Object.values(labExperimentStatusDict);

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
