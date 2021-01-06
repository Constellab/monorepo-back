import {Component, Input, OnInit} from '@angular/core';

/**
 * Component to show the json of protocol with limited height
 */
@Component({
  selector: 'gen-protocol-json',
  templateUrl: './protocol-json.component.html',
  styleUrls: ['./protocol-json.component.scss']
})
export class ProtocolJsonComponent implements OnInit {

  @Input() json: Record<string, unknown>;

  @Input() expandProtocol: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}
