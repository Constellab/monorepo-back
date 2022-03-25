import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlTagWithColor} from '../../fl-tag.class';

interface FlTagGroupColor {
  key: string;
  tags: FlTagColor[];
}

interface FlTagColor {
  value: string;
  color: string;
  activeColor: boolean;
}

/**
 * Component to list the tags with possible value and allow user to highlight some tags and select a color
 */
@Component({
  selector: 'fl-tags-select-colors',
  templateUrl: './fl-tags-select-colors.component.html',
  styleUrls: ['./fl-tags-select-colors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTagsSelectColorsComponent implements OnInit {

  @Input() tags: FlTagWithColor[];

  @Output() colorChange: EventEmitter<FlTagWithColor[]> = new EventEmitter();

  tagGroups: FlTagGroupColor[];

  colors: string[][] = FlColorHelper.getColorsGroups();

  constructor() {
  }

  ngOnInit(): void {
    const tagGroups: FlTagGroupColor[] = [];

    for (const tag of this.tags) {
      let tagGroup = tagGroups.find(tagGroup => tagGroup.key === tag.key);

      // create the group if it doesn't exist yet
      if (tagGroup == null) {
        tagGroup = {key: tag.key, tags: []};
        tagGroups.push(tagGroup);
      }

      tagGroup.tags.push({
        value: tag.value,
        color: tag.color,
        activeColor: false
      });
    }

    this.tagGroups = tagGroups;
  }

  toggleGroupColor(group: FlTagGroupColor): void {
    const groupIsColorized = this.groupIsColorized(group);
    for (const tag of group.tags) {
      if (groupIsColorized) {
        this.removeTagColor(tag);
      } else {
        this.setTagColor(tag);
      }
    }
    this.emitColors();
  }

  toggleTagColor(tag: FlTagColor): void {
    if (tag.activeColor) {
      this.removeTagColor(tag);
    } else {
      this.setTagColor(tag);
    }
    this.emitColors();
  }

  private setTagColor(tag: FlTagColor): void {
    tag.activeColor = true;
  }

  private removeTagColor(tag: FlTagColor): void {
    tag.activeColor = false;

  }

  emitColors(): void {
    const tagWithColor: FlTagWithColor[] = [];

    for (const group of this.tagGroups) {
      for (const tag of group.tags) {
        if (tag.activeColor) {
          tagWithColor.push({
            key: group.key,
            value: tag.value,
            color: tag.color,
          });
        }
      }
    }
    this.colorChange.emit(tagWithColor);
  }

  groupColor(group: FlTagGroupColor): ThemePalette | null {
    return this.groupIsColorized(group) ? 'primary' : null;
  }

  groupIsColorized(group: FlTagGroupColor): boolean {
    return group.tags.every(tag => tag.activeColor);
  }

  openColorSelector(tag: FlTagColor, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
  }


}
