import {Component, Input, OnInit} from '@angular/core';

/**
 * Show the doc of a process type
 */
@Component({
  selector: 'lab-process-doc',
  templateUrl: './lab-process-doc.component.html',
  styleUrls: ['./lab-process-doc.component.scss']
})
export class LabProcessDocComponent implements OnInit {

  @Input() doc: string;

  constructor() { }

  ngOnInit(): void {
  }

}
