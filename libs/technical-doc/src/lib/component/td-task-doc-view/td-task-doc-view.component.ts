import {Component, Input, OnInit} from '@angular/core';
import {TdTaskType} from '../../model/td-task-type.entity';

@Component({
  selector: 'td-task-doc-view',
  templateUrl: './td-task-doc-view.component.html',
  styleUrls: ['./td-task-doc-view.component.scss']
})
export class TdTaskDocViewComponent implements OnInit {

  @Input()
  task: TdTaskType;

  type: string;

  constructor() {
  }

  ngOnInit(): void {

  }
}
