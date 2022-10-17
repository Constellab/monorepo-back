import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {debounceTime, Observable, Subscription, switchMap} from 'rxjs';
import {FlDebouncer, FlQuillJson, FlTextEditorBasicConfig, FlTextEditorConfig} from '@monorepo/front-core-lib';
import {FormControl} from '@angular/forms';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';

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

  isLoading: boolean = false;

  private subscription: Subscription;

  constructor(private state: CaProjectDetailState,
              private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.project$ = this.state.getProject$();
    this.formControl = new FormControl({disabled: true, value: null});

    this.isLoading = true;
    this.subscription = this.state.getProjectId$().pipe(
      switchMap(projectId => this.projectService.getProjectDescription(projectId)),
    ).subscribe({
      next: description => this.descriptionLoaded(description),
      error: () => this.isLoading = false
    });

    this.canEdit$ = this.state.canEditProject$();

    this.formControl.valueChanges.pipe(
      debounceTime(FlDebouncer.AUTO_SAVE_DEBOUNCE_TIME)
    ).subscribe(
      value => this.saveDescription(value)
    );
  }

  private descriptionLoaded(description: FlQuillJson): void {
    // patch the value without emitting an event
    this.formControl.patchValue(description, {emitEvent: false});
    this.isLoading = false;
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
