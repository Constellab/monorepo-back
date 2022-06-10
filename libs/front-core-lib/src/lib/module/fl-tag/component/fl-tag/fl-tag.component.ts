import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlTag} from '../../fl-tag.class';
import {FlTagColorer} from '../../fl-tag-colorer.class';

/**
 * Simple component for tags
 */
@Component({
  selector: 'fl-tag',
  templateUrl: './fl-tag.component.html',
  styleUrls: ['./fl-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTagComponent implements OnInit {

  @Input() flTag: FlTag;

  @Input() tagColorer?: FlTagColorer;

  constructor() {
  }


  ngOnInit(): void {
  }


}
