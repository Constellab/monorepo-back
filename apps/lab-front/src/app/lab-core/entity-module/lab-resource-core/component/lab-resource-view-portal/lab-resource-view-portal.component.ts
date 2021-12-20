import {Component, ComponentFactoryResolver, Inject, OnInit} from '@angular/core';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FL_PORTAL_DATA, FlCoord} from '@monorepo/front-core-lib';
import {Subject} from 'rxjs';


@Component({
  selector: 'lab-resource-view-portal',
  templateUrl: './lab-resource-view-portal.component.html',
  styleUrls: ['./lab-resource-view-portal.component.scss']
})
export class LabResourceViewPortalComponent implements OnInit {

  view: LabResourceView;

  width: string;
  height: string;

  private size$ = new Subject<FlCoord>();

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              @Inject(FL_PORTAL_DATA) private input: LabResourceView) {
    this.view = input;

    if(input.type === 'multi-view'){
      this.width = 'min(1000px, 90vw)';
      this.height = 'min(1000px, 90vh)';
    }
    // else{
    //   this.width = '400px';
    //   this.height = '400px';
    // }
  }

  ngOnInit(): void {
    this.size$.next({x: 400, y: 400})
  }

}
