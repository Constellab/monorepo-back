import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'gen-biox-experiment-status-options',
  templateUrl: './biox-experiment-status-options.component.html',
  styleUrls: ['./biox-experiment-status-options.component.scss']
})
export class BioxExperimentStatusOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
