// # class ProtocolGraphConfigDTO(BaseModelDTO):
//     nodes: Dict[str, 'ProcessConfigDTO']
//     links: List[ConnectorDTO]
//     interfaces: Dict[str, IOFaceDTO]
//     outerfaces: Dict[str, IOFaceDTO]
//     layout: Optional[ProtocolLayoutDTO]

export interface CnScenarioProtocolGraph {
  nodes: Record<string, CnScenarioProcess>;
  links: any;
  interfaces: any;
  outerfaces: any;
  layout: any;
}

export interface CnScenarioProcess {
  process_typing_name: string;
  instance_name: string;
  config: any;
  name: string;
  brick_version_on_create: string;
  inputs: any;
  outputs: any;
  status: string;
  process_type: any;
  style: any;
  brick_version_on_run?: string;
  // provided if the process is a protocol
  graph?: CnScenarioProtocolGraph;
}

export interface CnScenarioProtocol {
  version: number;
  data: CnScenarioProcess;
}
