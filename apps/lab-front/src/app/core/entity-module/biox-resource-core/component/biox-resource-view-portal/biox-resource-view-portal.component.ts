import {Component, ComponentFactoryResolver, Inject, OnInit} from '@angular/core';
import {BioxResourceView} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';


@Component({
  selector: 'gen-biox-resource-view-portal',
  templateUrl: './biox-resource-view-portal.component.html',
  styleUrls: ['./biox-resource-view-portal.component.scss']
})
export class BioxResourceViewPortalComponent implements OnInit {

  view: BioxResourceView;

  width: string;
  height: string;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              @Inject(FL_PORTAL_DATA) private input: BioxResourceView) {
    this.view = input;

    if(input.type === 'multi-view'){
      this.width = 'min(1000px, 90vw)';
      this.height = 'min(1000px, 90vh)';
    }else{
      this.width = '400px';
      this.height = '400px';
    }
  }

  ngOnInit(): void {
  }

}
