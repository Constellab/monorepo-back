import {Component, Input, OnInit} from '@angular/core';
import {FlTag} from '../../fl-tag.class';

@Component({
  selector: 'fl-tag-list',
  templateUrl: './fl-tag-list.component.html',
  styleUrls: ['./fl-tag-list.component.scss']
})
export class FlTagListComponent implements OnInit {

  @Input() tags: FlTag[]

  constructor() { }

  ngOnInit(): void {
  }

}
