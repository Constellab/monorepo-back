import {Any, JsonConverter, JsonObject, JsonProperty} from 'json2typescript';
import {LabBaseEntity, LabEntity} from './lab-entity.entity';
import {ClCoreJsonConvert, ClRecordConverter} from '@monorepo/core-lib';
import {BioxLink} from '../entities/biox-link.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';


////////////////////////////////// BASE ///////////////////////////////////////


@JsonObject('BioxProcessableBase')
export class BioxProcessableBase extends LabBaseEntity {

  @JsonProperty('input_specs', Any, true)
  inputSpecs: Record<string, string[]> = null;

  @JsonProperty('output_specs', Any, true)
  outputSpecs: Record<string, string[]> = null;

  @JsonProperty('config_specs', Any, true)
  configSpecs: any = null;

  public getInputSpecsCount(): number {
    return (Object.keys(this.inputSpecs).length);
  }

  public getOutputSpecsCount(): number {
    return (Object.keys(this.outputSpecs).length);
  }

  public isProtocol(): boolean {
    return this.type === 'gws.model.Protocol';
  }

  public isProcess(): boolean {
    return !this.isProtocol();
  }

  public findInputSpec(inputName: string): string[] | undefined {
    return this.inputSpecs[inputName];
  }

  /**
   * Check if the input exists and if this input is compatible to
   * an input type.
   * It is compatible if all the output types are compatible with the input spec
   * @param inputSpecName name of the inputSpec to check
   * @param outputTypes outputSpec of another BioxProcessableBase
   */
  public outputSpecIsCompatible(inputSpecName: string, outputTypes: string[]): boolean {
    const input = this.findInputSpec(inputSpecName);
    if (input == null) {
      return false;
    }

    for (const outputType of outputTypes) {
      if (!input.includes(outputType)) {
        return false;
      }
    }
    return true;
  }

  public findOutputSpec(outputName: string): string[] | undefined {
    return this.outputSpecs[outputName];
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
}

export type BioxProcessDatasource = FlEntityPaginatedDatasource<BioxProcess>;

// create a union type to improve type checking
export type BioxProcessable = BioxProtocol | BioxProcess;
