
export interface BioxIOSpecResourceType {
  typing_name: string;
  human_name: string;
  short_description: string;
}

export type BioxIOSpecType = 'TypeIO' | 'ConstantOut'| 'SpecialTypeOut' | 'SkippableIn' |'OptionalIn'


export interface BioxIOSpec {
  type_io: BioxIOSpecType;
  data?: Record<string, any>
  resource_types: BioxIOSpecResourceType[]
}

/**
 * Spec for the input or output of a process
 */
export class BioxIO {

  resource_id: string;

  specs: BioxIOSpec;
}

