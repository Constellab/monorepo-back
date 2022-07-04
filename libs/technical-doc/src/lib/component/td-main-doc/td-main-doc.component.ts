import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {TdTypeEntity, TdUniqueType} from '../../model/td-type.entity';
import {TdTypingName} from '../../model/td-typing-name.entity';
import {FlColorHelper} from '@monorepo/front-core-lib';

@Component({
  selector: 'td-main-doc',
  templateUrl: './td-main-doc.component.html',
  styleUrls: ['./td-main-doc.component.scss'],
})
export class TdMainDocComponent implements OnInit {

  @Input() set entity(e: TdTypeEntity) {
    this._entity = e;
    this.setup();
  }

  _entity: TdTypeEntity;

  uniqueEntityParent: TdUniqueType;

  entityParentType: string;

  color: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  private setup(): void {
    this.uniqueEntityParent = {
      humanName: this._entity.parentHumanName,
      version: this._entity.parentVersion,
      typingName: this._entity.parentTypingName
    }
    if(this.uniqueEntityParent.typingName){
      this.entityParentType = new TdTypingName(this.uniqueEntityParent.typingName).getType();
      this.color = FlColorHelper.stringToRGBColor(this.uniqueEntityParent.typingName);
    }
  }

}
