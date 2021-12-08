import {Component, Input, OnInit} from '@angular/core';
import {BioxTaskService} from '../../../../entity-service/biox-task.service';
import {Observable} from 'rxjs';
import {BioxLabTypeEntity} from '../../../../model/entities/lab-type/biox-lab-type.entity';
import {BioxConfigData} from '../../../../model/entities/biox-config.entity';
import {BioxProcessType} from '../../../../model/entities/lab-type/biox-process-type.entity';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ClHelpService} from '@monorepo/core-lib';
import {FlGlobalValidators} from '@monorepo/front-core-lib';

interface BioxTransformResourceConfig {
  transformer: BioxProcessType;
  configData: BioxConfigData;
  hasConfig: boolean;
}

// TODO gérer l'initialisation avec des valeurs
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

  @Input() formGp: FormGroup;

  @Input() arrayMinLength: number = 0;

  transformersList$: Observable<BioxLabTypeEntity[]>;

  selectedTransformers: BioxTransformResourceConfig[] = [];


  constructor(private taskTypeService: BioxTaskService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGp.addControl('transformers', new FormArray([], FlGlobalValidators.arrayMinLength(this.arrayMinLength)));
    this.transformersList$ = this.taskTypeService.getTransformerByResourceType(this.resourceTypingName);
  }

  addTransformer(transformer: BioxProcessType): void {
    this.selectedTransformers.push({
      transformer: transformer,
      configData: BioxConfigData.fromSpecs(transformer.getConfigSpecs(),
        transformer.getConfigSpecs().getDefaultConfig()),
      hasConfig: transformer.hasConfigSpecs()
    });

    this.formArray.push(this.formBuilder.group({
      transformer: [transformer]
    }));
  }

  removeTransformer(index: number, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.selectedTransformers.splice(index, 1);
    this.formArray.removeAt(index);
  }

  drop(event: CdkDragDrop<BioxTransformResourceConfig[]>): void {
    moveItemInArray(this.selectedTransformers, event.previousIndex, event.currentIndex);
  }

  private get formArray(): FormArray {
    return this.formGp.get('transformers') as FormArray;
  }

  getFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

}
