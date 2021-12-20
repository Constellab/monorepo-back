
export interface LabIOSpecResourceType {
  typing_name: string;
  human_name: string;
  short_description: string;
}

export type LabIOSpecType = 'TypeIO' | 'ConstantOut'| 'SpecialTypeOut' | 'SkippableIn' |'OptionalIn'


export interface LabIOSpec {
  type_io: LabIOSpecType;
  data?: Record<string, any>
  resource_types: LabIOSpecResourceType[]
}

/**
 * Spec for the input or output of a process
 */
export class LabIO {

  resource_id: string;

  specs: LabIOSpec;
}

