import {FlTag, FlTagHelper, FlTagWithColor} from './fl-tag.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ClHelpService} from '@monorepo/core-lib';

export interface FlTagColorWithSelection extends FlTagWithColor {
  selected: boolean;
}

/**
 * Object to store the color of tags with possibility to select some tags
 */
export class FlTagColorer {

  private tags$: BehaviorSubject<FlTagColorWithSelection[]>;

  constructor(tagsColors: FlTagWithColor[], private colors: string[],
              private defaultColor: string = 'black') {
    this.tags$ = new BehaviorSubject(this.tagsWithColorToTagsWithSelection(tagsColors));
  }

  public static fromGroupedTags(tags: Record<string, string[]>, colorList: string[]): FlTagColorer {
    const tagWithColor = FlTagHelper.tagGroupsToTagWithColors(tags, colorList);
    return new FlTagColorer(tagWithColor, colorList);
  }

  /**
   * Get the color of an object based on its tags
   */
  public static getObjectColor(tags: Record<string, string>,
                               tagColors: FlTagWithColor[], defaultColor: string = 'black'): string {
    if (tags == null) return defaultColor;

    for (const key of Object.keys(tags)) {
      // check that the tag key value is listed in the tag colors
      const tagColor = tagColors.find(tag => tag.key === key && tag.value === tags[key]);
      // if the key value has a color, return it
      if (tagColor) {
        return tagColor.color;
      }
    }
    return defaultColor;
  }

  /**
   * Add tags to the list of tags, keep the original tags and colors and append the new tags
   * @param tags
   */
  public addTags(tags: Record<string, string[]>): void {
    const currentTags = ClHelpService.deepClone(this.tags$.value);

    // set the index from the length of the current tags to get next colors
    let colorIndex = currentTags.length;

    Object.keys(tags).forEach(tagKey => {
      // generate a color for each tag value
      tags[tagKey].forEach(tagValue => {

        // generate a new color only if the tag is not already in the list
        if (currentTags.find(t => t.key === tagKey && t.value === tagValue) == null) {
          currentTags.push({
            key: tagKey,
            value: tagValue,
            color: this.colors[colorIndex % this.colors.length],
            selected: false
          });
          colorIndex++;
        }
      });
    });

    this.tags$.next(currentTags);
  }

  public getTags$(): Observable<FlTagColorWithSelection[]> {
    return this.tags$.asObservable();
  }

  public getTagColor(tags: FlTag): string {
    return this.getTagColorFromTag(tags, this.tags$.value);
  }


  public getTagColor$(tags: FlTag): Observable<string> {
    return this.tags$.pipe(map(tagColors => this.getTagColorFromTag(tags, tagColors)));
  }

  public getSelectedTagColor$(tags: FlTag): Observable<string> {
    return this.getSelectedTags$().pipe(
      map((tagColors) => this.getTagColorFromTag(tags, tagColors))
    );
  }

  private getTagColorFromTag(tag: FlTag, tagColors: FlTagWithColor[]): string {
    const tagColor = tagColors.find(t => tag.key === t.key && tag.value === t.value);
    // if the key value has a color, return it
    if (tagColor) {
      return tagColor.color;
    }

    return this.defaultColor;
  }

  public getTaggedObjectColor(tags: Record<string, string>): string {
    return FlTagColorer.getObjectColor(tags, this.tags$.value, this.defaultColor);
  }

  public getTaggedObjectColor$(tags: Record<string, string>): Observable<string> {
    return this.tags$.pipe(map(tagColors => FlTagColorer.getObjectColor(tags, tagColors, this.defaultColor)));
  }

  /**
   * Set the list of selected tags and update the colors of selected tags
   * @param selectedTags
   */
  public setSelectedTags(selectedTags: FlTagWithColor[]): void {
    const tags = ClHelpService.deepClone(this.tags$.value);

    for (const tag of tags) {
      const selected = selectedTags.find(selectedTag => selectedTag.key === tag.key && selectedTag.value === tag.value);

      if (selected) {
        tag.selected = true;
        // also refresh the color of the tag
        tag.color = selected.color;
      } else {
        tag.selected = false;
      }
    }
    this.tags$.next(tags);
  }

  public setTagColors(tagsColors: FlTagWithColor[]): void {
    this.tags$.next(this.tagsWithColorToTagsWithSelection(tagsColors));
  }

  public getSelectedTags$(): Observable<FlTagWithColor[]> {
    return this.tags$.asObservable().pipe(
      map((tagColors) => tagColors.filter(tagColor => tagColor.selected))
    );
  }

  private tagsWithColorToTagsWithSelection(tagWithColor: FlTagWithColor[]): FlTagColorWithSelection[] {
    return tagWithColor.map(t => ({
      key: t.key, value: t.value, color: t.color, selected: false
    }));
  }

  hasTags$(): Observable<boolean> {
    return this.tags$.pipe(map(tags => tags.length > 0));
  }

  destroy(): void {
    this.tags$.complete();
  }
}
