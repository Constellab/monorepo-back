import {Component, Input, OnInit} from '@angular/core';
import {LabVEnvCompleteInfo} from '../../../model/entities/lab-venv.entity';

@Component({
  selector: 'lab-venv-complete-info',
  templateUrl: './lab-venv-complete-info.component.html',
  styleUrls: ['./lab-venv-complete-info.component.scss']
})
export class LabVenvCompleteInfoComponent implements OnInit {

  @Input() venvCompleteInfo: LabVEnvCompleteInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
