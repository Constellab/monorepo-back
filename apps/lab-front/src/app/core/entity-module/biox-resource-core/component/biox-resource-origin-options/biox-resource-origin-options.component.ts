import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'gen-biox-resource-origin-options',
  templateUrl: './biox-resource-origin-options.component.html',
  styleUrls: ['./biox-resource-origin-options.component.scss']
})
export class BioxResourceOriginOptionsComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  constructor(@Host() @Optional() public select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
