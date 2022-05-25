import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {TdTypeEntity, TdUniqueType} from '../../model/td-type.entity';

@Component({
  selector: 'td-main-doc',
  templateUrl: './td-main-doc.component.html',
  styleUrls: ['./td-main-doc.component.scss']
})
export class TdMainDocComponent implements OnInit {

  @Input()
  entity: TdTypeEntity;

  uniqueEntityParent: TdUniqueType;

  constructor(private domSanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.uniqueEntityParent = {
      humanName: this.entity.parentHumanName,
      version: this.entity.parentVersion,
      typingName: this.entity.parentTypingName
    }
  }

}
