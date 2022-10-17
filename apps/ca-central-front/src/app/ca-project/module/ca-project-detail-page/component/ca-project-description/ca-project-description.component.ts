import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {debounceTime, Observable, Subscription} from 'rxjs';
import {FlDebouncer, FlQuillJson, FlTextEditorBasicConfig, FlTextEditorConfig} from '@monorepo/front-core-lib';
import {FormControl} from '@angular/forms';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';

@Component({
  selector: 'ca-project-description',
  templateUrl: './ca-project-description.component.html',
  styleUrls: ['./ca-project-description.component.scss']
})
export class CaProjectDescriptionComponent implements OnInit, OnDestroy {

  project$: Observable<CaProject>;
  canEdit$: Observable<boolean>;

  edit: boolean = false;
  formControl: FormControl;

  textEditorConfig: FlTextEditorConfig = new FlTextEditorBasicConfig();

  private subscription: Subscription;

  constructor(private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.project$ = this.state.getProject$();
    this.formControl = new FormControl({disabled: true, value: null});

    this.subscription = this.state.getProject$().subscribe(
      // patch the value without emitting an event
      project => this.formControl.patchValue(project.description, {emitEvent: false})
    );

    this.canEdit$ = this.state.canEditProject$();

    this.formControl.valueChanges.pipe(
      debounceTime(FlDebouncer.AUTO_SAVE_DEBOUNCE_TIME)
    ).subscribe(
      value => this.saveDescription(value)
    );
  }

  private saveDescription(description: FlQuillJson): void {
    this.state.updateDescription(description);
  }

  toggleEdit(): void {
    this.edit = !this.edit;
    if (this.edit) {
      this.formControl.enable();
    } else {
      this.formControl.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
