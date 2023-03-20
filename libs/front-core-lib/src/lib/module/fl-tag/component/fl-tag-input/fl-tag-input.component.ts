import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import {NgControl, UntypedFormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, mergeMap, startWith, tap} from 'rxjs/operators';
import {TAB} from '@angular/cdk/keycodes';
import {ClHelpService, clRxjsElasticSearch} from '@monorepo/core-lib';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';
import {FlTag, FlTagEntity, FlTagHelper, FlTagService} from '../../fl-tag.class';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';

type FlTagInput = FlTag[] | Record<string, string>

@Component({
  selector: 'fl-tag-input',
  templateUrl: './fl-tag-input.component.html',
  styleUrls: ['./fl-tag-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTagInputComponent extends FlFormFieldDirective<FlTag[], FlTagInput> implements OnInit {

  @Input() searchDebounceTime: number = 300;

  @Input() label: string = 'flTag.tags';

  @Input() maxLength: number = FlTagHelper.MAX_LENGTH;

  /**
   * Different mode for the input
   * When record,  return a record of tags
   * When array, return a FlTag[]
   */
  @Input() mode: 'record' | 'array' = 'array';

  @Output() tagChange: EventEmitter<FlTagInput> = new EventEmitter();

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

  separatorKeysCodes: number[] = [TAB];
  inputCtrl = new UntypedFormControl();

  filteredOptions: Observable<string[]>;

  allTags: FlTagEntity[] = [];

  // provided when adding a new tag. It is set when the key has been defined but not the value
  // this is a temp storage
  newTag: FlTagEntity;

  constructor(@Optional() @Self() ngControl: NgControl,
              private tagService: FlTagService,
              private cdr: ChangeDetectorRef) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.switchMode('key');
  }

  /**
   * Use to switch option modes
   * @param mode
   * @private
   */
  private switchMode(mode: 'key' | 'value'): void {
    if (mode === 'key') {
      const inputObs = this.inputCtrl.valueChanges.pipe(
        clRxjsElasticSearch(this.searchDebounceTime, 1),
      );

      this.filteredOptions = inputObs.pipe(
        mergeMap((inputText) => this.searchTags(inputText))
      );
    } else {
      const inputObs = this.inputCtrl.valueChanges.pipe(
        clRxjsElasticSearch(100, 0),
        startWith(''),
      );

      this.filteredOptions = inputObs.pipe(
        map((inputText) => this.filterArray(this.newTag.values, inputText))
      );
    }
  }


  private searchTags(inputText: string): Observable<string[]> {
    return this.tagService.searchTag(inputText).pipe(
      tap(tags => this.allTags = tags),
      map(tags => tags.map(tag => tag.key))
    );
  }

  callChangeEvent(value: FlTagInput): void {
    this.tagChange.next(value);
  }

  onDisableChange(disable: boolean): void {
    if (disable) {
      this.inputCtrl.disable();
    } else {
      this.inputCtrl.enable();
    }
  }

  writeValue(obj: FlTag[]): void {
    if (obj == null) {
      this.value = [];
    } else {
      this.value = this.convertOuterToInner(obj);
    }

    this.cdr.markForCheck();
  }

  // function to filter an array
  private filterArray(array: string[], text: string | null): string[] {
    if (text) {
      const filterValue = text.toLowerCase();
      return array.filter(fruit => fruit.toLowerCase().includes(filterValue));
    } else {
      return array.slice();
    }
  }

  // true when the user is selecting the tag value
  get isValueSelection(): boolean {
    return this.newTag != null;
  }


  remove(tag: FlTag): void {
    const index = this.value.findIndex(t => t.key === tag.key);

    if (index >= 0) {
      this.value.splice(index, 1);
      this.emitCurrentValue();
    }
  }

  removeTempFruit(): void {
    this.newTag = null;
    this.switchMode('key');
  }

  /**
   * Method to add the tag with enter, only if there is no autocomplete
   * Because if there is an autocomplete, this method is called after the add
   * @param event
   */
  onEnterDown(event: Event): void {
    ClHelpService.stopEventPropagation(event);
    setTimeout(() => {
      if (ClHelpService.isNullOrEmpty(this.input.nativeElement.value)) return;
      this.addUnknownValue();
    }, 0);
  }

  // call when adding a tag without selecting an option
  addUnknownValue(): void {
    const value = (this.input.nativeElement.value || '').trim();
    this.addChip(value);
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.addChip(event.option.viewValue);
  }

  private addChip(value: string): void {
    if (!value) return;
    if (this.isValueSelection) {
      if (this.value == null) this.value = [];
      this.setAndEmitValue(FlTagHelper.addOrReplaceTag(this.value, {key: this.newTag.key, value: value}));
      this.emitCurrentValue();

      // clear the new tag key (to switch to key selection)
      this.newTag = null;
      this.switchMode('key');
    } else {
      // find the selected tag and save it
      this.newTag = this.allTags.find(t => t.key === value) ?? {key: value, values: []};
      this.switchMode('value');

      // force reopening the panel after clear
      setTimeout(() => this.autocompleteTrigger.openPanel(), 0);
    }

    // clear the input
    this.input.nativeElement.value = '';
    this.inputCtrl.setValue(null);
  }

  dropChip(event: CdkDragDrop<FlTag[]>): void {
    moveItemInArray(this.value, event.previousIndex, event.currentIndex);
    this.emitCurrentValue();
  }


  protected convertOuterToInner(outerValue: FlTagInput): FlTag[] {
    if (outerValue == null) return [];
    if (Array.isArray(outerValue)) return outerValue;

    const tags: FlTag[] = [];
    for (const key of Object.keys(outerValue)) {
      tags.push({key: key, value: outerValue[key]});
    }
    return tags;
  }

  // convert into correct format based on component mode
  protected convertInnerToOuter(innerValue: FlTag[]): FlTagInput {
    if (this.mode === 'array') {
      return innerValue;
    } else {
      const tags: Record<string, string> = {};
      for (const tag of innerValue) {
        tags[tag.key] = tag.value;
      }
      return tags;
    }
  }
}
