import { CnScenarioProtocol } from './cn-scenario.entity';

export class CnProtocolMigrator{


  public migrateProtocol(protocol: CnScenarioProtocol): CnScenarioProtocol {
    if (protocol.version === 3) {
      return protocol;
    }

    if (protocol.version === 1) {
      protocol = this.migrateProtocolFromV1ToV2(protocol);
    }

    if (protocol.version === 2) {
      protocol = this.migrateProtocolFromV2ToV3(protocol);
    }

    return protocol;
  }

  // to keep until all labs are V 0.7.5 or higher
  private migrateProtocolFromV1ToV2(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const newProtocolData = this.migrateProcessFromV1ToV2Recur(protocol.data);
    return {
      version: 2,
      data: newProtocolData
    };
  }

  private migrateProcessFromV1ToV2Recur(protocol: any): any {
    if (!protocol.name) {
      protocol.name = protocol.human_name;
    }

    protocol.process_type = {
      human_name: protocol.human_name,
      short_description: protocol.short_description
    };

    delete protocol.human_name;
    delete protocol.short_description;


    if (protocol.graph) {

      for (const key in protocol.graph.nodes) {
        const process = protocol.graph.nodes[key];
        if (!process.name) {
          process.name = process.human_name;
        }

        process.process_type = {
          human_name: process.human_name,
          short_description: process.short_description
        };

        delete process.human_name;
        delete process.short_description;

        if (process.graph) {
          this.migrateProcessFromV1ToV2Recur(process);
        }
      }

      if (protocol.graph.interfaces) {
        for (const key in protocol.graph.interfaces) {
          const inter = protocol.graph.interfaces[key];
          if (inter.to) {
            inter.process_instance_name = inter.to.node;
            inter.port_name = inter.to.port;
            delete inter.to;
          }
          if (inter.from) {
            delete inter.from;
          }
        }
      }

      if (protocol.graph.outerfaces) {
        for (const key in protocol.graph.outerfaces) {
          const outerface = protocol.graph.outerfaces[key];
          if (outerface.from) {
            outerface.process_instance_name = outerface.from.node;
            outerface.port_name = outerface.from.port;
            delete outerface.from;
          }
          if (outerface.to) {
            delete outerface.to;
          }
        }
      }
    }
    return protocol;
  }

  // to keep until all labs are V 0.7.5 or higher
  private migrateProtocolFromV2ToV3(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const newProtocolData = this.migrateProcessFromV2ToV3Recur(protocol.data);
    return {
      version: 3,
      data: newProtocolData
    };
  }

  // V3 version was declare on gws_core v 0.8.2
  // update version to brick_version_on_create and brick_version_on_run
  private migrateProcessFromV2ToV3Recur(protocol: any): any {
    if (protocol.graph) {

      for (const key in protocol.graph.nodes) {
        const process = protocol.graph.nodes[key];

        if (process.brick_version) {
          process.brick_version_on_create = process.brick_version;
          process.brick_version_on_run = process.brick_version;
          delete process.brick_version;
        }

        if (process.graph) {
          this.migrateProcessFromV2ToV3Recur(process);
        }
      }
    }

    return protocol;
  }
}
