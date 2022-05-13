
export interface TdIOSpecResourceType {
  typing_name: string;
  human_name: string;
  short_description: string;
}

export type TdIOSpecType = 'TypeIO' | 'ConstantOut'| 'SpecialTypeOut' | 'SkippableIn' |'OptionalIn'


export interface TdIOSpec {
  type_io: TdIOSpecType;
  data?: Record<string, any>
  resource_types: TdIOSpecResourceType[]
}
