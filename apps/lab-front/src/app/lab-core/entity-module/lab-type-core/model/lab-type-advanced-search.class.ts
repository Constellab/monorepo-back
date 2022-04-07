import {FlFormInputsManagerConfig, FlSearchCriteriaConverter} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabTypeObjectSubType, LabTypeObjectType} from '../../../model/entities/lab-type/lab-type.entity';

/**
 * config for the lab type search component
 */
export type LabTypeSearchConfig =
  // Mode to filter on Task or protocol by default
  {
    mode: 'taskOrProtocol'
  } |
  // Mode to filter on transformer for a specific resource
  {
    mode: 'transformer',
    resourceTypingName: string
  }

/**
 * Format of the data for the Advanced search form of the resource
 */
export class LabTypeSearchFields {
  brick: string[];
  text: string;
  objectType: LabTypeObjectType[];
  objectSubType: LabTypeObjectSubType;
  relatedModelTypingName: string;
}


export class LabTypeSearch {

  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<LabTypeSearchFields> = {
    text: 'name',
    objectSubType: 'biox.process_type_type'
  };

  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabTypeSearchFields> = {
    brick: {key: 'brick', operator: 'IN'},
    text: {key: 'text', operator: 'MATCH'},
    objectType: {key: 'object_type', operator: 'IN'},
    objectSubType: {key: 'object_sub_type', operator: 'EQ'},
    relatedModelTypingName: {key: 'related_model_typing_name', operator: 'EQ'},
  };

  public static getAdvancedSearchForm(): FormGroup<LabTypeSearchFields> {
    return new FormBuilder().group(
      {
        brick: [[]],
        text: [null],
        objectType: [null],
        objectSubType: [null],
        relatedModelTypingName: [null],
      }
    );
  }


}
