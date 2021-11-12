import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlTag} from '../../fl-tag.class';
import {MatChip} from '@angular/material/chips';

/**
 * Directive to place on a chip to make it a tag chip
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'mat-chip[flTag]',
  templateUrl: './fl-tag.component.html',
  styleUrls: ['./fl-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTagComponent implements OnInit {

  @Input() flTag: FlTag;

  constructor(private matChip: MatChip) {
  }


  ngOnInit(): void {
  }

  get removable(): boolean{
    return this.matChip.removable;
  }

}
