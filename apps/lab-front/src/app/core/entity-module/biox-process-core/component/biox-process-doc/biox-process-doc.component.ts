import {Component, Input, OnInit} from '@angular/core';

/**
 * Show the doc of a process type
 */
@Component({
  selector: 'gen-biox-process-doc',
  templateUrl: './biox-process-doc.component.html',
  styleUrls: ['./biox-process-doc.component.scss']
})
export class BioxProcessDocComponent implements OnInit {

  @Input() doc: string;

  constructor() { }

  ngOnInit(): void {
  }

}
