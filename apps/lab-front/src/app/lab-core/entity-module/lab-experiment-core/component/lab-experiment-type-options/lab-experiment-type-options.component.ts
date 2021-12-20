import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, FlStatus} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {labExperimentTypeDict} from '../../../../model/entities/lab-experiment.entity';

@Component({
  selector: 'lab-experiment-type-options',
  templateUrl: './lab-experiment-type-options.component.html',
  styleUrls: ['./lab-experiment-type-options.component.scss']
})
export class LabExperimentTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  statusList: FlStatus[] = Object.values(labExperimentTypeDict);

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
