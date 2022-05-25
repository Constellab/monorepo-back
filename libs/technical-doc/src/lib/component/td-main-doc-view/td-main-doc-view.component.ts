import {Component, Input, OnInit, SecurityContext} from '@angular/core';
import {marked} from 'marked';
import {DomSanitizer} from '@angular/platform-browser';
import {TdTypeEntity, TdUniqueType} from '../../model/td-type.entity';

@Component({
  selector: 'td-main-doc-view',
  templateUrl: './td-main-doc-view.component.html',
  styleUrls: ['./td-main-doc-view.component.scss']
})
export class TdMainDocViewComponent implements OnInit {

  @Input()
  entity: TdTypeEntity;

  uniqueEntityParent: TdUniqueType;

  docContent: string;

  constructor(private domSanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.docContent = this.domSanitizer.sanitize(SecurityContext.HTML, marked.parse(this.entity.doc));
    this.uniqueEntityParent = {
      humanName: this.entity.parentHumanName,
      version: this.entity.parentVersion,
      typingName: this.entity.parentTypingName
    }
  }

}
