import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabConfigData, LabConfigureSpecsForm} from '../../../../model/entities/lab-config.entity';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ClHelpService} from '@monorepo/core-lib';
import {
  LabConfigureSpecsFormComponent
} from '../../../lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {ControlContainer} from '@angular/forms';
import {FlDialogService, FlGlobalValidators} from '@monorepo/front-core-lib';
import {LabTransformerWithConfig} from '../../../../model/global/lab-transformer.class';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {
  LabSelectTypeDialogComponent,
  LabSelectTypeDialogInput
} from '../../../lab-type-core/component/lab-select-type-dialog/lab-select-type-dialog.component';

interface LabSelectedTransformer {
  transformer: LabProcessType;
  configData: LabConfigData;
  hasConfig: boolean;
}

export interface LabTransformResourceForm {
  transformer: LabProcessType;
  config: LabConfigureSpecsForm;
}

/**
 * Component to transform a resource using transformers.
 * Can add multiple transformer and configure them.
 */
@Component({
  selector: 'lab-transform-resource',
  templateUrl: './lab-transform-resource.component.html',
  styleUrls: ['./lab-transform-resource.component.scss'],
})
export class LabTransformResourceComponent implements OnInit {

  @Input() resourceTypingName: string;

  selectedTransformers: LabSelectedTransformer[] = [];

  formArray: FormArray<LabTransformResourceForm>;

  loadingProcessType: boolean = false;

  constructor(private typeService: LabTypeService,
              private controlContainer: ControlContainer,
              private cdr: ChangeDetectorRef,
              private dialogService: FlDialogService) {
  }


  // Call this method to build the form array before using the component
  public static buildFormArray(transformers: LabTransformerWithConfig[] = [],
                               arrayMinLength: number = 0): FormArray<LabTransformResourceForm> {
    const formArray = new FormArray([], FlGlobalValidators.arrayMinLength(arrayMinLength));
    for (const transformer of transformers) {
      formArray.push(this.buildFormGroup(transformer));
    }
    return formArray;
  }

  private static buildFormGroup(transformer: LabTransformerWithConfig): FormGroup<LabTransformResourceForm> {
    const configData = LabConfigData.fromSpecs(transformer.transformer.configSpecs, transformer.config);
    return (new FormBuilder().group({
      transformer: [transformer.transformer],
      config: LabConfigureSpecsFormComponent.buildFormGroup(configData)
    }));
  }


  ngOnInit(): void {
    this.formArray = this.controlContainer.control as any;

    // init the selected transformers with form value
    for (const transformer of this.formArray.value) {
      this.createSelectedTransformer(transformer.transformer);
    }
  }

  addTransformer(transformer: LabProcessType): void {
    const selectedTransformer = this.createSelectedTransformer(transformer);

    this.formArray.push(new FormGroup({
      transformer: new FormControl(transformer),
      config: LabConfigureSpecsFormComponent.buildFormGroup(selectedTransformer.configData)
    }));

    // force the cdr because it can alter the form status, so we need to refresh
    this.cdr.detectChanges();
  }

  private createSelectedTransformer(transformer: LabProcessType): LabSelectedTransformer {
    const configData = LabConfigData.fromSpecs(transformer.configSpecs);

    const selectedTransformer: LabSelectedTransformer = {
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

  drop(event: CdkDragDrop<LabSelectedTransformer[]>): void {
    moveItemInArray(this.selectedTransformers, event.previousIndex, event.currentIndex);
  }

  getFormGroup(index: number): FormGroup<LabTransformResourceForm> {
    return this.formArray.at(index) as any;
  }

  selectTransformer(): void {
    const data: LabSelectTypeDialogInput = {
      searchConfig: {
        mode: 'transformer',
        resourceTypingNames: [this.resourceTypingName]
      }
    };
    this.dialogService.openBigDialog(LabSelectTypeDialogComponent, {data: data}).afterClosed().subscribe(
      processType => this.loadAndAddTransformer(processType)
    );
  }

  // load the process type object and add it to the form
  private loadAndAddTransformer(processType?: LabTypeEntity): void {
    if (!processType) return;

    this.loadingProcessType = true;
    this.typeService.getTyping(processType.typingName).subscribe({
      next: processType => {
        this.loadingProcessType = false;
        this.addTransformer(processType);
      },
      error: () => this.loadingProcessType = false
    });
  }
}
