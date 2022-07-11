import {Component, Input, OnInit} from '@angular/core';
import {TdTypingName} from '../../model/td-typing-name.entity';
import {TdTypeObjectType} from '../../model/td-type.entity';

@Component({
  selector: 'td-type-unavailable',
  templateUrl: './td-type-unavailable.component.html',
  styleUrls: ['./td-type-unavailable.component.scss']
})
export class TdTypeUnavailableComponent implements OnInit {

  @Input() typingName: string;

  brickName: string;
  objectType: TdTypeObjectType;


  constructor() {
  }

  ngOnInit(): void {
    const typingName = new TdTypingName(this.typingName);
    this.brickName = typingName.getBrickName();
    this.objectType = typingName.getType();
  }

  get objectTypeText(): string {
    switch (this.objectType) {
      case 'RESOURCE':
        return 'td.type_unavailable_detail_resource';
      case 'PROTOCOL':
      case 'TASK':
        return 'td.type_unavailable_detail_process';
    }

    return null;
  }

}
