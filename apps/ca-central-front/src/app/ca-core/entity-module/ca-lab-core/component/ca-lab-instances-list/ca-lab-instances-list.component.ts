import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/ca-lab-instance.class';

@Component({
  selector: 'ca-lab-instances-list',
  templateUrl: './ca-lab-instances-list.component.html',
  styleUrls: ['./ca-lab-instances-list.component.scss']
})
export class CaLabInstancesListComponent implements OnInit {

  @Input() labInstances: CaLabInstance[];


  constructor() {
  }

  ngOnInit(): void {
  }

  onLabUpdated(lab: CaLabInstance, index: number): void {
    this.labInstances[index] = lab;
  }

}
