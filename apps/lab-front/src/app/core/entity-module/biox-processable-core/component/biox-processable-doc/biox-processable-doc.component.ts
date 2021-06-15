import {Component, Input, OnInit} from '@angular/core';

/**
 * Show the doc of a process type
 */
@Component({
  selector: 'gen-biox-processable-doc',
  templateUrl: './biox-processable-doc.component.html',
  styleUrls: ['./biox-processable-doc.component.scss']
})
export class BioxProcessableDocComponent implements OnInit {

  @Input() doc: string;

  constructor() { }

  ngOnInit(): void {
  }

}
