import {Any, JsonConverter, JsonObject, JsonProperty} from 'json2typescript';
import {LabBaseEntity, LabEntity} from './lab-entity.entity';
import {ClCoreJsonConvert, ClRecordConverter} from '@monorepo/core-lib';
import {BioxLink} from '../entities/biox-link.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';


////////////////////////////////// BASE ///////////////////////////////////////


@JsonObject('BioxProcessableBase')
export class BioxProcessableBase extends LabBaseEntity {

  @JsonProperty('input_specs', Any, true)
  inputSpecs: any = null;

  @JsonProperty('output_specs', Any, true)
  outputSpecs: any = null;

  @JsonProperty('config_specs', Any, true)
  configSpecs: any = null;

  // Todo remove + 1
  public getInputSpecsCount(): number {
    return (Object.keys(this.inputSpecs).length) + 1;
  }

  public getOutputSpecsCount(): number {
    return (Object.keys(this.outputSpecs).length) + 1;
  }
}


////////////////////////////////// PROTOCOL ///////////////////////////////////////


/**
 * Converter for the biox processable nodes
 */
@JsonConverter
export class BioxProtocolGraphNodeConverter extends ClRecordConverter<BioxProcessable> {
  deserializeItem(item: LabBaseEntity): BioxProcessable {
    if (item.type === 'gws.model.Protocol') {
      return ClCoreJsonConvert.deserializeObject(item, BioxProtocol);
    } else {
      return ClCoreJsonConvert.deserializeObject(item, BioxProcess);
    }
  }
}

@JsonObject('BioxProtocolGraph')
export class BioxProtocolGraph extends LabEntity {

  @JsonProperty('title', String, true)
  title: any = null;

  @JsonProperty('interfaces', Any)
  interfaces: Record<string, unknown> = null;

  @JsonProperty('outerfaces', Any)
  outerfaces: Record<string, unknown> = null;

  @JsonProperty('layout', Any)
  layout: Record<string, unknown> = null;

  @JsonProperty('links', [BioxLink])
  links: BioxLink[] = null;

  @JsonProperty('nodes', BioxProtocolGraphNodeConverter)
  nodes: Record<string, BioxProcessable> = null;
}

@JsonObject('BioxProtocolData')
export class BioxProtocolData extends LabEntity {
  // python class link
  @JsonProperty('input_specs', Any, true)
  inputSpecs: any = null;

  @JsonProperty('output_specs', Any, true)
  outputSpecs: any = null;

  // protocol detail
  @JsonProperty('graph', BioxProtocolGraph, true)
  graph: BioxProtocolGraph = null;
}

@JsonObject('BioxProtocol')
export class BioxProtocol extends BioxProcessableBase {

  // python class link
  @JsonProperty('type', String, true)
  type: 'gws.model.Protocol' = null;

  @JsonProperty('data', BioxProtocolData, true)
  data: BioxProtocolData = null;

  objectType: 'protocol' = 'protocol';

  getTitle(): string {
    return this.type;
  }
}

export type BioxProtocolDatasource = FlEntityPaginatedDatasource<BioxProtocol>;


////////////////////////////////// PROCESS ///////////////////////////////////////

@JsonObject('BioxProcessData')
export class BioxProcessData extends LabEntity {

  @JsonProperty('title', String, true)
  title: string = null;

  @JsonProperty('description', String, true)
  description: string = null;
}

@JsonObject('BioxProcess')
export class BioxProcess extends BioxProcessableBase {

  @JsonProperty('data', BioxProcessData, true)
  data: BioxProcessData = null;

  objectType: 'process' = 'process';

  getTitle(): string {
    return this.data.title;
  }
}

export type BioxProcessDatasource = FlEntityPaginatedDatasource<BioxProcess>;

// create a union type to improve type checking
export type BioxProcessable = BioxProtocol | BioxProcess;
