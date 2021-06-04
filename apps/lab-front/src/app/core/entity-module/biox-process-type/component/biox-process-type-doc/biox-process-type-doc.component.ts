import {Component, Input, OnInit} from '@angular/core';

/**
 * Show the doc of a process type
 */
@Component({
  selector: 'gen-biox-process-type-doc',
  templateUrl: './biox-process-type-doc.component.html',
  styleUrls: ['./biox-process-type-doc.component.scss']
})
export class BioxProcessTypeDocComponent implements OnInit {

  @Input() doc: string;

  constructor() { }

  ngOnInit(): void {
  }

}
