import {Component, Input, OnInit, SecurityContext} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TdProcessType} from '../../model/td-process-type.entity';
import {marked} from 'marked';
import {DomSanitizer} from '@angular/platform-browser';
import {TdTypingName} from '../../model/td-typing-name.entity';

@Component({
  selector: 'td-main-doc-view',
  templateUrl: './td-main-doc-view.component.html',
  styleUrls: ['./td-main-doc-view.component.scss']
})
export class TdMainDocViewComponent implements OnInit {

  @Input()
  doc: TdProcessType;

  docContent: string;

  constructor( private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.docContent = this.domSanitizer.sanitize( SecurityContext.HTML, marked.parse(this.doc.doc));
  }

}
