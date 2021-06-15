import {Component, Input, OnInit} from '@angular/core';

/**
 * Component to show a list of port with associated types
 */
@Component({
  selector: 'gen-biox-processable-ports-list',
  templateUrl: './biox-processable-ports-list.component.html',
  styleUrls: ['./biox-processable-ports-list.component.scss']
})
export class BioxProcessablePortsListComponent implements OnInit {

  @Input() ports: Record<string, string[]>

  constructor() { }

  ngOnInit(): void {
  }

}
