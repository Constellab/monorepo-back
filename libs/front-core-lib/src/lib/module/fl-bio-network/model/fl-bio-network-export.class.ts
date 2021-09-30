// position of nodes with id
export class FlBioNetworkExportNodePosition {
  id: string;
  x: number;
  y: number;
}

// export the positions of the network nodes
export class FlBioNetworkExportPosition {
  metabolites: FlBioNetworkExportNodePosition[];
  reactions: FlBioNetworkExportNodePosition[];
}
