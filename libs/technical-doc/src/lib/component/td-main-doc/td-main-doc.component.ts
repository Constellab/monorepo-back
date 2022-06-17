import {Component, Input, OnInit} from '@angular/core';
import {TdTypeEntity, TdUniqueType} from '../../model/td-type.entity';
import {TdTypingName} from '../../model/td-typing-name.entity';
import {FlColorHelper} from '@monorepo/front-core-lib';

@Component({
  selector: 'td-main-doc',
  templateUrl: './td-main-doc.component.html',
  styleUrls: ['./td-main-doc.component.scss']
})
export class TdMainDocComponent implements OnInit {

  @Input()
  entity: TdTypeEntity;

  uniqueEntityParent: TdUniqueType;

  entityParentType: string;

  color: string;

  constructor() {
  }

  ngOnInit(): void {
    this.uniqueEntityParent = {
      humanName: this.entity.parentHumanName,
      version: this.entity.parentVersion,
      typingName: this.entity.parentTypingName
    }
    this.entityParentType = new TdTypingName(this.uniqueEntityParent.typingName).getType();
    this.color = FlColorHelper.stringToRGBColor(this.uniqueEntityParent.typingName);
  }



}
