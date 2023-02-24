import {Component, Input, OnInit} from '@angular/core';
import {LabProgressMessage} from '../../../../model/entities/lab-progress-bar.entity';

@Component({
  selector: 'lab-progress-message',
  templateUrl: './lab-progress-message.component.html',
  styleUrls: ['./lab-progress-message.component.scss']
})
export class LabProgressMessageComponent implements OnInit {

  @Input() progressMessage: LabProgressMessage;

  constructor() { }

  ngOnInit(): void {
  }

}
