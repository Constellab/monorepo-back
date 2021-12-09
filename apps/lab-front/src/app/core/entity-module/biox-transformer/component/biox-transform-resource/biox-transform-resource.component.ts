import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BioxTaskService} from '../../../../entity-service/biox-task.service';
import {Observable} from 'rxjs';
import {BioxLabTypeEntity} from '../../../../model/entities/lab-type/biox-lab-type.entity';
import {BioxConfigData} from '../../../../model/entities/biox-config.entity';
import {BioxProcessType} from '../../../../model/entities/lab-type/biox-process-type.entity';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ClHelpService} from '@monorepo/core-lib';
import {
  BioxConfigureSpecsForm,
  BioxConfigureSpecsFormComponent
} from '../../../biox-config-core/component/biox-configure-specs-form/biox-configure-specs-form.component';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {ControlContainer} from '@angular/forms';
import {FlGlobalValidators} from '@monorepo/front-core-lib';
import {BioxTransformerWithConfig} from '../../../../model/global/biox-transformer.class';

interface SelectedTransformer {
  transformer: BioxProcessType;
  configData: BioxConfigData;
  hasConfig: boolean;
}

export interface BioxTransformResourceForm {
  transformer: BioxProcessType;
  config: BioxConfigureSpecsForm;
}

/**
 * Component to transform a resource using transformers.
 * Can add multiple transformer and configure them.
 */
@Component({
  selector: 'gen-biox-transform-resource',
  templateUrl: './biox-transform-resource.component.html',
  styleUrls: ['./biox-transform-resource.component.scss'],
})
export class BioxTransformResourceComponent implements OnInit {

  @Input() resourceTypingName: string;

  transformersList$: Observable<BioxLabTypeEntity[]>;

  selectedTransformers: SelectedTransformer[] = [];

  formArray: FormArray<BioxTransformResourceForm>;

  constructor(private taskTypeService: BioxTaskService,
              private controlContainer: ControlContainer,
              private cdr: ChangeDetectorRef) {
  }


  // Call this method to build the form array before using the component
  public static buildFormArray(transformers: BioxTransformerWithConfig[] = [],
                               arrayMinLength: number = 0): FormArray<BioxTransformResourceForm> {
    const formArray = new FormArray([], FlGlobalValidators.arrayMinLength(arrayMinLength));
    for (const transformer of transformers) {
      formArray.push(this.buildFormGroup(transformer));
    }
    return formArray;
  }

  private static buildFormGroup(transformer: BioxTransformerWithConfig): FormGroup<BioxTransformResourceForm> {
    const configData = BioxConfigData.fromSpecs(transformer.transformer.getConfigSpecs(), transformer.config);
    return (new FormBuilder().group({
      transformer: [transformer.transformer],
      config: BioxConfigureSpecsFormComponent.buildFormGroup(configData)
    }));
  }


  ngOnInit(): void {
    this.formArray = this.controlContainer.control as any;

    // init the selected transformers with form value
    for (const transformer of this.formArray.value) {
      this.createSelectedTransformer(transformer.transformer);
    }

    this.transformersList$ = this.taskTypeService.getTransformerByResourceType(this.resourceTypingName);
  }

  addTransformer(transformer: BioxProcessType): void {
    const selectedTransformer = this.createSelectedTransformer(transformer);

    this.formArray.push(new FormGroup({
      transformer: new FormControl(transformer),
      config: BioxConfigureSpecsFormComponent.buildFormGroup(selectedTransformer.configData)
    }));

    // force the cdr because it can alter the form status, so we need to refresh
    this.cdr.detectChanges();
  }

  private createSelectedTransformer(transformer: BioxProcessType): SelectedTransformer {
    const configData = BioxConfigData.fromSpecs(transformer.getConfigSpecs(),
      transformer.getConfigSpecs().getDefaultConfig());

    const selectedTransformer: SelectedTransformer = {
      transformer: transformer,
      configData: configData,
      hasConfig: transformer.hasConfigSpecs()
    };

    this.selectedTransformers.push(selectedTransformer);
    return selectedTransformer;
  }

  removeTransformer(index: number, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.selectedTransformers.splice(index, 1);
    this.formArray.removeAt(index);
  }

  drop(event: CdkDragDrop<SelectedTransformer[]>): void {
    moveItemInArray(this.selectedTransformers, event.previousIndex, event.currentIndex);
  }

  getFormGroup(index: number): FormGroup<BioxTransformResourceForm> {
    return this.formArray.at(index) as any;
  }
}
