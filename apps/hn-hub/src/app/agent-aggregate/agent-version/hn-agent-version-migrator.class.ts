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
    const params: Record<string, any> = {
      specs: {},
      values: {},
    };
    for (const param of (agentVersionFileInput.params as string).split('\n')) {
      const [key, value] = param.split('=');
      const v = this.parseValue(value);
      params['specs'][key] = this.getBasicParamSpecs(v);
      params['values'][key] = v;
    }
    agentVersionFileInput.params = params;
    return agentVersionFileInput;
  }

  public migrateAgentVersionToSpecificVersion(
    agentVersionDto: HnAgentVersionDto,
    version: number
  ): HnAgentVersionDto {
    if (!(agentVersionDto.params as Record<string, any>)?.specs) {
      agentVersionDto.params = {
        specs: {},
        values: {},
      };
    }

    if (version === 1) {
      if ((agentVersionDto.params as Record<string, any>)?.specs) {
        const params = [];
        for (const [key, value] of Object.entries((agentVersionDto.params as Record<string, any>).values)) {
          params.push(`${key}=${value}`);
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

    if (version === 2) {
      if ((agentVersionDto.params as Record<string, any>)?.specs) {
        let params: string = '';
        for (const [key, value] of Object.entries((agentVersionDto.params as Record<string, any>).values)) {
          params = (params + `${key}=${value}\n`) as string;
        }
        agentVersionDto.params = params;
        return agentVersionDto;
      }
      if (agentVersionDto.params instanceof Array) {
        agentVersionDto.params = (agentVersionDto.params as string[]).join('\n');
        return agentVersionDto;
      } else {
        return agentVersionDto;
      }
    }

    if (version === 3) {
      if ((agentVersionDto.params as Record<string, any>)?.specs) {
        return agentVersionDto;
      } else if (agentVersionDto.params instanceof Array) {
        const params: Record<string, any> = {
          specs: {},
          values: {},
        };
        for (const param of agentVersionDto.params as string[]) {
          const [key, value] = param.trim().split('=');
          const v = this.parseValue(value);
          params['specs'][key] = this.getBasicParamSpecs(v);
          params['values'][key] = v;
        }
        agentVersionDto.params = params;
        return agentVersionDto;
      } else {
        const params: Record<string, any> = {
          specs: {},
          values: {},
        };
        for (const param of (agentVersionDto.params as string).split('\n')) {
          const [key, value] = param.split('=');
          const v = this.parseValue(value);
          params['specs'][key] = this.getBasicParamSpecs(v);
          params['values'][key] = v;
        }
        agentVersionDto.params = params;
        return agentVersionDto;
      }
    }
    return agentVersionDto;
  }

  private parseValue(value: string): any {
    try {
      // Tenter de parser comme JSON
      if (
        (value as string).includes(',') &&
        !(value as string).includes('[') &&
        !(value as string).includes('{')
      ) {
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
