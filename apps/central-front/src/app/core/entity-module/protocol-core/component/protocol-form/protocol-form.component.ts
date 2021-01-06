import {Component, Input, OnInit} from '@angular/core';
import {Protocol, protocolSchema} from '../../../../model/entities/protocol.entity';
import {FormGroup} from '@ngneat/reactive-forms';

/**
 * Component that take a Protocol FormGroup to manage the protocol form
 */
@Component({
  selector: 'gen-protocol-form',
  templateUrl: './protocol-form.component.html',
  styleUrls: ['./protocol-form.component.scss'],
})
export class ProtocolFormComponent implements OnInit {

  @Input() formGp: FormGroup<Partial<Protocol>>;

  protocolSchema: object = protocolSchema;


  ngOnInit(): void {
  }

}
