import {Component, Input, OnInit} from '@angular/core';
import {BioxProcess} from '../../../../model/entities/biox-processable.entity';

@Component({
  selector: 'gen-biox-process-card',
  templateUrl: './biox-process-card.component.html',
  styleUrls: ['./biox-process-card.component.scss']
})
export class BioxProcessCardComponent implements OnInit {

  @Input() process: BioxProcess;

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.process);
  }

}
