import {Component, Input, OnInit} from '@angular/core';
import {LabInstance} from '../../../../model/entities/lab-instance.class';

@Component({
  selector: 'gen-lab-instances-list',
  templateUrl: './lab-instances-list.component.html',
  styleUrls: ['./lab-instances-list.component.scss']
})
export class LabInstancesListComponent implements OnInit {

  @Input() labInstances: LabInstance[];


  constructor() {
  }

  ngOnInit(): void {
  }

  onLabUpdated(lab: LabInstance, index: number): void {
    this.labInstances[index] = lab;
  }

}
