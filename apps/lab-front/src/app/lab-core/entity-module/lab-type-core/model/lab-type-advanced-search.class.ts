import {FlFormInputsManagerConfig, FlSearchCriteriaConverter} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabSearchConverter} from '../../../model/global/lab-search-converter.class';
import {TdTypeObjectSubType, TdTypeObjectType} from '@monorepo/technical-doc';

/**
 * config for the lab type search component
 */
export type LabTypeSearchConfig =
// Mode to filter on Task or protocol by default
  {
    mode: 'taskOrProtocol';
  } |
  // Mode to filter on transformer for a specific resource
  {
    mode: 'transformer';
    resourceTypingNames: string[];
  } |

  // Mode to filter on importers for a specific resource and extension
  {
    mode: 'importer';
    resourceTypingName: string;
    extension: string;
  }


/**
 * Format of the data for the Advanced search form of the resource
 */
export class LabTypeSearchFields {
  brick: string[];
  text: string;
  objectType: TdTypeObjectType[];
  objectSubType: TdTypeObjectSubType;
  includeDeprecated: boolean;
  importerIgnoreExtension: boolean; // only for importer mode, if true we don't filter on file extension
}


export class LabTypeSearch {

  /**
   * Const to configure Form Input Manager for advanced search
   */
  public static advancedSearchManagerConfig: FlFormInputsManagerConfig<LabTypeSearchFields> = {
    text: 'name',
    objectSubType: 'biox.process_type_type',
    includeDeprecated: 'biox.type_include_deprecated',
    importerIgnoreExtension: 'biox.type_importer_ignore_extension'
  };

  /**
   * Convert used by the advanced search to convert the form result to list of {@link FlSearchCriteria}
   */
  public static advancedSearchConverter: FlSearchCriteriaConverter<LabTypeSearchFields> = {
    brick: {key: 'brick', operator: 'IN'},
    text: {key: 'text', operator: 'MATCH'},
    objectType: {key: 'object_type', operator: 'IN'},
    objectSubType: {key: 'object_sub_type', operator: 'EQ'},
    importerIgnoreExtension: {key: 'importer_ignore_extension', operator: 'EQ'},
    includeDeprecated: {key: 'include_deprecated', operator: 'EQ', convertValue: LabSearchConverter.includeAllOnCheck}
  };

  public static getAdvancedSearchForm(): FormGroup<LabTypeSearchFields> {
    return new FormBuilder().group(
      {
        brick: [[]],
        text: [null],
        objectType: [null],
        objectSubType: [null],
        importerIgnoreExtension: [null],
        includeDeprecated: [null],
      }
    );
  }


}
