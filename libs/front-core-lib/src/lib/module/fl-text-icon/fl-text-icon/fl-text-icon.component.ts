import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

/**
 * Component to display and icon along with a text.
 * This component uses the flex display with the FlexLayoutModule
 *
 * The icon should be wrap in a mat-icon tag.
 *
 * The text can be any tag.
 */
@Component({
  selector: 'fl-text-icon',
  templateUrl: './fl-text-icon.component.html',
  styleUrls: ['./fl-text-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTextIconComponent implements OnInit {

  /**
   * The gap between the icon and the text
   */
  @Input() gap = '10px';

  /**
   * The position of the icon. Start --> the icon before the text. End --> the icon is after the text
   */
  @Input() iconPosition: 'start' | 'end' = 'start';

  constructor() {
  }

  ngOnInit(): void {
  }

}
