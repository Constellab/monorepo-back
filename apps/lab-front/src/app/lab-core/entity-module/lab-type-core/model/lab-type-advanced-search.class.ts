import {FlFormInputsManagerConfig, FlSearchCriteriaConverter} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';

/**
 * Format of the data for the Advanced search form of the resource
 */
export class LabTypeSearchFields {
  brick: string[];
  text: string;
  objectSubType: string;
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
    objectSubType: {key: 'object_sub_type', operator: 'EQ'},
  };

  public static getAdvancedSearchForm(): FormGroup<LabTypeSearchFields> {
    return new FormBuilder().group(
      {
        brick: [[]],
        text: [null],
        objectSubType: [null],
      }
    );
  }


}
