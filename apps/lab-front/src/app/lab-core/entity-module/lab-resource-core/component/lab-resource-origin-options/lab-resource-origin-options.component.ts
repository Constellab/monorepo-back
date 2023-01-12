import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';

@Component({
  selector: 'lab-resource-origin-options',
  templateUrl: './lab-resource-origin-options.component.html',
  styleUrls: ['./lab-resource-origin-options.component.scss']
})
export class LabResourceOriginOptionsComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
