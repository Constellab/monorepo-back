import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlTag, FlTagSelectedEvent} from '../../fl-tag.class';

@Component({
  selector: 'fl-tag-list',
  templateUrl: './fl-tag-list.component.html',
  styleUrls: ['./fl-tag-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTagListComponent implements OnInit {

  @Input() tags: FlTag[];

  @Input() tagSelectable: boolean = false;

  @Input() limitNumber: number = Infinity;

  @Input() showNoTagMessage: boolean = false;

  @Output() tagSelected: EventEmitter<FlTagSelectedEvent> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  selectTag(tag: FlTag, event: MouseEvent): void {
    this.tagSelected.next({
      tag: tag,
      event: event
    });
  }

}
