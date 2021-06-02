import {Component, Input, OnInit} from '@angular/core';

/**
 * Component to show a list of port with associated types
 */
@Component({
  selector: 'gen-biox-process-ports-list',
  templateUrl: './biox-process-ports-list.component.html',
  styleUrls: ['./biox-process-ports-list.component.scss']
})
export class BioxProcessPortsListComponent implements OnInit {

  @Input() ports: Record<string, string[]>

  constructor() { }

  ngOnInit(): void {
  }

}
