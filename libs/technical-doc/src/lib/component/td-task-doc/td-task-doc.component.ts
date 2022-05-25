import {Component, Input, OnInit} from '@angular/core';
import {TdTaskType} from '../../model/td-task-type.entity';

@Component({
  selector: 'td-task-doc',
  templateUrl: './td-task-doc.component.html',
  styleUrls: ['./td-task-doc.component.scss']
})
export class TdTaskDocComponent implements OnInit {

  @Input()
  task: TdTaskType;

  type: string;

  constructor() {
  }

  ngOnInit(): void {

  }
}
