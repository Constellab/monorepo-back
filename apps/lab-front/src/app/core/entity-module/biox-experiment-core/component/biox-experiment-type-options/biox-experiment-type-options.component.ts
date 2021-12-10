import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'gen-biox-experiment-type-options',
  templateUrl: './biox-experiment-type-options.component.html',
  styleUrls: ['./biox-experiment-type-options.component.scss']
})
export class BioxExperimentTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective
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
