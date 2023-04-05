import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {FlInputSearchOptionDirective} from '../../directive/fl-input-search-option.directive';
import {FlViewContext} from '../../../../model/fl-view-context.class';
import {FlDatasourcePaginated} from '../../../../model/datasource/fl-datasource-paginated.class';
import {clRxjsElasticSearch} from '@monorepo/core-lib';
import {FlInputSearchPrefixDirective} from '../../directive/fl-input-search-prefix.directive';

/**
 * Input/Select component to search for a entity and select one.
 * Should be wrap by a component that supports form and is specific to the entity.
 */
@Component({
  selector: 'fl-input-search',
  templateUrl: './fl-input-search.component.html',
  styleUrls: ['./fl-input-search.component.scss']
})
export class FlInputSearchComponent<T> implements OnInit, OnDestroy {

  @Input() set selectedItem(selectedItem: T | Observable<T>) {
    if (selectedItem instanceof Observable) {
      this.clearInitObs();
      this.initWithObs(selectedItem);
    } else {
      this._selectedItem = selectedItem;
      this.refreshInputCtrl();
    }
  }

  _selectedItem: T;

  @Output() selectedItemChange: EventEmitter<T> = new EventEmitter();

  @Input() datasource: FlDatasourcePaginated<T>;

  @Input() placeholder: string = 'Search';

  @Input() required: boolean = false;

  @Input() set disabled(disabled: boolean) {
    if (disabled) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable();
    }
  }

  /**
   * Event emitted when the input is focused, this is useful to init the list of items
   */
  @Output() focused: EventEmitter<T | null> = new EventEmitter();

  @ViewChild('input', {static: false, read: ElementRef}) input: ElementRef<HTMLInputElement>;

  // get the option template
  @ContentChild(FlInputSearchOptionDirective, {read: TemplateRef}) optionTemplate: TemplateRef<FlViewContext<T>>;

  // get the prefix template
  @ContentChild(FlInputSearchPrefixDirective, {read: TemplateRef}) prefixTemplate?: TemplateRef<FlViewContext<T>>;

  items$: Observable<T[]>;

  inputControl: FormControl<string> = new FormControl();

  // true when an observable is used to init the selected item
  initIsLoading: boolean = false;


  // if true, the next focus event will be ignored
  private ignoreFocus: boolean = false;

  private initSubscription?: Subscription;

  ngOnInit(): void {
    if (this.datasource == null) {
      throw new Error('[FlInputSearch] the input datasource is required');
    }
    this.items$ = this.datasource.connect();

    this.inputControl.valueChanges.pipe(
      clRxjsElasticSearch(350, 2)
    ).subscribe(value => {
      this.datasource.getFirstPage(value);
    });
  }

  itemSelected(): void {
    this.setSelectedItemAndEmit(this.inputControl.value as any);

    // once the item is selected, the input will be re-focused
    // so, we need to ignore the next focus event
    this.ignoreFocus = true;

    // remove focus from the input, so the init input will not be called
    setTimeout(() => {
      this.input.nativeElement.blur();
    }, 0);

    // cancel the init observable, because value was overridden
    this.clearInitObs();
  }

  onFocus(): void {
    if (this.ignoreFocus) {
      this.ignoreFocus = false;
      return;
    }

    this.refreshInputCtrl();
    if (this._selectedItem) {
      // select the input value with caret
      this.input.nativeElement.setSelectionRange(0, this._selectedItem.toString().length);
    }

    this.focused.emit(this._selectedItem);

  }

  onBlur(): void {
    // when the input is clear, we considered that the item was removed
    if (this.inputControl.value === '') {
      this.setSelectedItemAndEmit(null);
    }
    this.refreshInputCtrl();
  }

  private setSelectedItemAndEmit(item: T): void {
    this._selectedItem = item;
    this.selectedItemChange.next(item);
  }

  /**
   * Get the context for the prefix template
   * Only return the object when there is a selected item and the input value is not a string
   * When the input value is a string, it means that the user is typing something, so we consider
   * that there is not value for the prefix template
   */
  getPrefixTemplateContext(): FlViewContext<T> {
    const selectedItem: T | null = this._selectedItem && typeof this.inputControl.value !== 'string' ?
      this._selectedItem : null;
    return {
      $implicit: selectedItem
    };
  }

  /**
   * Refresh the input control value base on the selected item
   * If there is a selected item, the input value will be the selected item
   * If there is no selected item, the input value will be an empty string
   * @private
   */
  private refreshInputCtrl(): void {
    if (this._selectedItem) {
      this.inputControl.setValue(this._selectedItem as any);
    } else {
      this.inputControl.setValue('');
    }
  }

  // can be useful when initializing the input with a partial object
  private initWithObs(obs: Observable<T>): void {
    this.initIsLoading = true;
    this.initSubscription = obs.subscribe({
      next: item => {
        this.initIsLoading = false;
        // if a item was selected before the init, we don't override it
        if (this._selectedItem) return;
        // for this case, we trigger the change because this is the full object
        this.setSelectedItemAndEmit(item);
        this.refreshInputCtrl();
      },
      error: () => this.initIsLoading = false
    });
  }

  private clearInitObs(): void {
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
      this.initSubscription = undefined;
    }
    this.initIsLoading = false;
  }

  ngOnDestroy(): void {
    this.clearInitObs();
  }



}
