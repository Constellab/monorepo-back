import {ClLuxonTransform, ClRecordWrapperTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BioxNode} from '../global/biox-connection.class';
import {Expose} from 'class-transformer';
import {BioxConfigSpecs, BioxConfigSpecTyped} from './biox-config.entity';

export class BioxProcessableBase extends BioxNode {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, string[]>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, string[]>;

  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecTyped)
  @Expose({name: 'config_specs'})
  configSpecs: BioxConfigSpecs;

  // python class link
  type: string;

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime;

  public getInputSpecs(): Record<string, string[]> {
    return this.inputSpecs ?? {};
  }

  public getOutputSpecs(): Record<string, string[]> {
    return this.outputSpecs ?? {};
  }

  public getInputSpecsCount(): number {
    return (Object.keys(this.getInputSpecs()).length);
  }

  public getOutputSpecsCount(): number {
    return (Object.keys(this.getOutputSpecs()).length);
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

  public hasConfigSpecs(): boolean {
    return this.configSpecs.hasProperties();
  }
}
