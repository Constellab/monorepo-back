
export interface TdIOSpecResourceType {
  typing_name: string;
  human_name: string;
  short_description: string;
}

export interface TdIOSpec {
  data?: Record<string, any>
  resource_types: TdIOSpecResourceType[]
}
