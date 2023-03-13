import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, FlStatus} from '@monorepo/front-core-lib';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {labExperimentStatusDict} from '../../../../model/entities/lab-experiment.entity';

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
