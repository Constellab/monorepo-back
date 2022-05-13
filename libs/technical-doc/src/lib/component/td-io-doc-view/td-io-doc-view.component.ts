import {Component, Input, OnInit} from '@angular/core';
import {TdIOSpecDTO} from '../../model/td-task-type.entity';
import {ActivatedRoute} from '@angular/router';
import {TdTypingName} from '../../model/td-typing-name.entity';

@Component({
  selector: 'td-io-doc-view',
  templateUrl: './td-io-doc-view.component.html',
  styleUrls: ['./td-io-doc-view.component.scss']
})
export class TdIoDocViewComponent implements OnInit {

  @Input()
  ioSpecs: Record<string, TdIOSpecDTO>;

  constructor() { }

  ngOnInit(): void {

  }

}
