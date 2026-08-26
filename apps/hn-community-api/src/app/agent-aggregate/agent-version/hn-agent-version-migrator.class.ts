import { HnAgentVersionFileInput } from '../agent/hn-agent.dto';
import { HnAgentVersionDto } from './hn-agent-version.dto';

export class HnAgentVersionMigrator {
  // TODO: Not necessary if all labs have a version over 0.13.0
  public migrateAgentVersionFile(agentVersionFile: HnAgentVersionFileInput): HnAgentVersionFileInput {
    if (agentVersionFile.json_version === 2) {
      return this.migrateAgentVersionFileFromV2ToV3(agentVersionFile);
    }

    if (agentVersionFile.json_version === 1) {
      return this.migrateAgentVersionFileFromV2ToV3(this.migrateAgentVersionFileFromV1ToV2(agentVersionFile));
    }

    return agentVersionFile;
  }

  private migrateAgentVersionFileFromV1ToV2(
    agentVersionFileInput: HnAgentVersionFileInput
  ): HnAgentVersionFileInput {
    agentVersionFileInput.json_version = 2;
    agentVersionFileInput.params = (agentVersionFileInput.params as string[]).join('\n');
    return agentVersionFileInput;
  }

  private migrateAgentVersionFileFromV2ToV3(
    agentVersionFileInput: HnAgentVersionFileInput
  ): HnAgentVersionFileInput {
    agentVersionFileInput.json_version = 3;
    agentVersionFileInput.params = this.buildParamsFromEntries(
      (agentVersionFileInput.params as string).split('\n')
    );
    return agentVersionFileInput;
  }

  public migrateAgentVersionToSpecificVersion(
    agentVersionDto: HnAgentVersionDto,
    version: number
  ): HnAgentVersionDto {
    // Only params that carry no readable content at all are defaulted. Defaulting on the absence
    // of `specs` alone replaced a legacy array or newline-string params with an empty one, which
    // emptied the params of every agent version still stored in a pre-v3 format — and made the
    // legacy branches of each migration below unreachable, since `specs` was then always set.
    if (!this.holdsLegacyParams(agentVersionDto.params) && !this.holdsV3Params(agentVersionDto.params)) {
      agentVersionDto.params = {
        specs: {},
        values: {},
      };
    }

    if (version === 1) {
      return this.migrateAgentVersionToV1(agentVersionDto);
    }

    if (version === 2) {
      return this.migrateAgentVersionToV2(agentVersionDto);
    }

    if (version === 3) {
      return this.migrateAgentVersionToV3(agentVersionDto);
    }

    return agentVersionDto;
  }

  /** Whether params are still in a pre-v3 format: a list of `key=value`, or one newline-separated. */
  private holdsLegacyParams(params: HnAgentVersionDto['params']): boolean {
    return params instanceof Array || (typeof params === 'string' && params !== '');
  }

  /** Whether params are already the v3 `{ specs, values }` object. */
  private holdsV3Params(params: HnAgentVersionDto['params']): boolean {
    return (params as Record<string, any>)?.specs != null;
  }

  private migrateAgentVersionToV1(agentVersionDto: HnAgentVersionDto): HnAgentVersionDto {
    if ((agentVersionDto.params as Record<string, any>)?.specs) {
      const params = [];
      for (const [key, value] of Object.entries((agentVersionDto.params as Record<string, any>).values)) {
        params.push(`${key}=${String(value)}`);
      }
      agentVersionDto.params = params;
      return agentVersionDto;
    } else if (agentVersionDto.params instanceof Array) {
      return agentVersionDto;
    } else {
      agentVersionDto.params = (agentVersionDto.params as string).split('\n');
      return agentVersionDto;
    }
  }

  private migrateAgentVersionToV2(agentVersionDto: HnAgentVersionDto): HnAgentVersionDto {
    if ((agentVersionDto.params as Record<string, any>)?.specs) {
      let params: string = '';
      for (const [key, value] of Object.entries((agentVersionDto.params as Record<string, any>).values)) {
        params = params + `${key}=${String(value)}\n`;
      }
      agentVersionDto.params = params;
      return agentVersionDto;
    }
    if (agentVersionDto.params instanceof Array) {
      agentVersionDto.params = agentVersionDto.params.join('\n');
      return agentVersionDto;
    } else {
      return agentVersionDto;
    }
  }

  private migrateAgentVersionToV3(agentVersionDto: HnAgentVersionDto): HnAgentVersionDto {
    const agentVersionDtoRes: HnAgentVersionDto = this.migrateParamsToV3(agentVersionDto);

    this.renameLegacySpecsFlags(agentVersionDtoRes.inputSpecs?.specs);
    this.renameLegacySpecsFlags(agentVersionDtoRes.outputSpecs?.specs);

    return agentVersionDtoRes;
  }

  private migrateParamsToV3(agentVersionDto: HnAgentVersionDto): HnAgentVersionDto {
    if ((agentVersionDto.params as Record<string, any>)?.specs) {
      const specs = (agentVersionDto.params as Record<string, any>).specs;
      for (const key of Object.keys(specs)) {
        if (specs[key]['type'] == 'string') {
          specs[key]['type'] = 'str';
        }
      }
      agentVersionDto.params = {
        specs: specs,
        values: (agentVersionDto.params as Record<string, any>).values,
      };
      return agentVersionDto;
    }

    if (agentVersionDto.params instanceof Array) {
      agentVersionDto.params = this.buildParamsFromEntries(
        agentVersionDto.params.map((param) => param.trim())
      );
      return agentVersionDto;
    }

    agentVersionDto.params = this.buildParamsFromEntries((agentVersionDto.params as string).split('\n'));
    return agentVersionDto;
  }

  /**
   * Rename the specs flags that were prefixed with `is_` before the v3
   */
  private renameLegacySpecsFlags(specs: Record<string, any> | undefined): void {
    if (!specs) {
      return;
    }

    for (const spec of Object.keys(specs)) {
      if ('is_optional' in specs[spec]) {
        specs[spec]['optional'] = specs[spec]['is_optional'];
        delete specs[spec]['is_optional'];
      }

      if ('is_constant' in specs[spec]) {
        specs[spec]['constant'] = specs[spec]['is_constant'];
        delete specs[spec]['is_constant'];
      }
    }
  }

  /**
   * Build the v3 params (specs and values) from a list of `key=value` entries
   */
  private buildParamsFromEntries(entries: string[]): Record<string, any> {
    const params: Record<string, any> = {
      specs: {},
      values: {},
    };
    for (const param of entries) {
      const [key, value] = param.split('=');
      const v = this.parseValue(value);
      params['specs'][key] = this.getBasicParamSpecs(v);
      params['values'][key] = v;
    }
    return params;
  }

  private parseValue(value: string): any {
    try {
      // Tenter de parser comme JSON
      if (value.includes(',') && !value.includes('[') && !value.includes('{')) {
        value = '[' + value + ']';
      }
      return JSON.parse(value);
    } catch {
      // Si le parsing JSON échoue, vérifier si c'est un nombre
      if (!isNaN(Number(value))) {
        return Number(value);
      }
      // Si ce n'est pas un nombre, retourner le string original
      return value;
    }
  }

  private getBasicParamSpecs(value: any): Record<string, any> {
    return {
      type: this.getValueTypeString(value),
      optional: false,
    };
  }

  private getValueTypeString(value: any): string {
    if (typeof value === 'number') {
      // check if float
      if (Number.isInteger(value)) {
        return 'int';
      }
      return 'float';
    }
    if (typeof value === 'string') {
      return 'str';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (Array.isArray(value)) {
      return 'list';
    }
    return 'string';
  }
}
