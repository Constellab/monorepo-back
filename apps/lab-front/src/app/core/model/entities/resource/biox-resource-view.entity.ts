import {Expose} from 'class-transformer';
import {ClCsvJson, ClHelpService, ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecBase, BioxConfigSpecs} from '../biox-config-spec.entity';

// list of available view type
export type BioxResourceViewType = 'view' | 'json-view' | 'text-view' | 'table-view' | 'network-view' | 'image-view';

export class BioxResourceViewSpec {
  @Expose({name: 'method_name'})
  methodName: string;

  @Expose({name: 'view_type'})
  viewType: BioxResourceViewType;

  @Expose({name: 'human_name'})
  humanName: string;

  @Expose({name: 'short_description'})
  shortDescription: string;

  // object describing the type of the configs and default values of the view
  @Expose({name: 'view_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  viewSpecs: BioxConfigSpecs;

  // object describing the type of the configs and default values of the view methods
  @Expose({name: 'method_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  methodSpecs: BioxConfigSpecs;

  @Expose({name: 'default_view'})
  defaultView: boolean;

  getName(): string {
    return this.humanName ?? this.methodName;
  }


}

/**
 * Object that contains the resource view spec and its configuration
 */
export interface BioxResourceViewSpecWithConfig {
  viewSpec: BioxResourceViewSpec;

  config: BioxResourceViewConfig;
}

export class BioxResourceViewConfig {
  @Expose({name: 'method_config'})
  methodConfig: Record<string, any>;

  @Expose({name: 'view_config'})
  viewConfig: Record<string, any>;

  constructor(methodConfig: Record<string, any> = {}, viewConfig: Record<string, any> = {}) {
    this.methodConfig = methodConfig;
    this.viewConfig = viewConfig;
  }

  public clone(): BioxResourceViewConfig {
    return new BioxResourceViewConfig(ClHelpService.deepClone(this.methodConfig), ClHelpService.deepClone(this.viewConfig));
  }

}


export class BioxResourceViewBase {
  type: BioxResourceViewType;
  data: any;
}

export class BioxResourceViewJson extends BioxResourceViewBase {
  type: 'json-view';
  data: Record<string, any>;
}

export const bioxResourceViewTextSpecPage: string = 'page';

export class BioxResourceViewText extends BioxResourceViewBase {
  type: 'text-view';
  data: string;
  is_first_page: boolean;
  is_last_page: boolean;
  last_page: number;
  next_page: number;
  number_of_items_per_page: number;
  page: number;
  prev_page: number;
  total_number_of_items: number;
  total_number_of_pages: number;
}

export class BioxResourceViewTable extends BioxResourceViewBase {
  type: 'table-view';
  data: ClCsvJson;
}

export class BioxResourceViewNetwork extends BioxResourceViewBase {
  type: 'network-view';
  data: any;
}

export class BioxResourceViewImage extends BioxResourceViewBase {
  type: 'image-view';
  data: any;
}

export type BioxResourceView = BioxResourceViewJson;

// Record of view type, icon
const constBioxResourceViewIcon: Record<BioxResourceViewType, { icon: string, text: string }> = {
  view: {icon: 'view_quilt', text: 'biox.resource_view_base'},
  'json-view': {icon: 'code', text: 'biox.resource_view_json'},
  'text-view': {icon: 'text_snippet', text: 'biox.resource_view_text'},
  'table-view': {icon: 'calendar_view_month', text: 'biox.resource_view_spreadsheet'},
  'network-view': {icon: 'share', text: 'biox.resource_view_pathway'},
  'image-view': {icon: 'insert_photo', text: 'biox.resource_view_image'},
};

/**
 * Object that group view specs by type
 */
export interface BioxResourceViewSpecsByType {
  viewType: BioxResourceViewType;
  icon: string;
  text: string;
  viewSpec: BioxResourceViewSpec[];
}

export function bioxGroupResourceViewSpecsByType(views: BioxResourceViewSpec[]): BioxResourceViewSpecsByType[] {
  const viewsByType: Record<string, BioxResourceViewSpecsByType> = {};

  for (const view of views) {
    // get the type with 'view' by default if the type is not known
    const type: BioxResourceViewType = constBioxResourceViewIcon[view.viewType] != null ? view.viewType : 'view';

    if (viewsByType[type] == null) {
      const viewTypeInfo = constBioxResourceViewIcon[type];

      viewsByType[type] = {
        icon: viewTypeInfo.icon,
        text: viewTypeInfo.text,
        viewType: view.viewType,
        viewSpec: []
      };
    }

    viewsByType[type].viewSpec.push(view);
  }

  return Object.values(viewsByType);
}
