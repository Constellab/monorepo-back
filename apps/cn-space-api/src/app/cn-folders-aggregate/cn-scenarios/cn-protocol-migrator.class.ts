import { CnScenarioProtocol } from './cn-scenario-protocol.class';

export class CnProtocolMigrator {
  public migrateProtocol(protocol: CnScenarioProtocol): CnScenarioProtocol {
    if (protocol.version === 1) {
      protocol = this.migrateProtocolFromV1ToV2(protocol);
    }

    if (protocol.version === 2) {
      protocol = this.migrateProtocolFromV2ToV3(protocol);
    }

    if (protocol.version === 3) {
      return protocol;
    }
    return protocol;
  }

  // to keep until all labs are V 0.7.5 or higher
  private migrateProtocolFromV1ToV2(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const newProtocolData = this.migrateProcessFromV1ToV2Recur(protocol.data);
    return {
      version: 2,
      data: newProtocolData,
    };
  }

  private migrateProcessFromV1ToV2Recur(protocol: any): any {
    this.migrateProcessTypeFromV1ToV2(protocol);
    this.migrateGraphFromV1ToV2(protocol);
    return protocol;
  }

  /**
   * Migrate what a process holds below it, leaving the process itself alone.
   *
   * Separate from {@link migrateProcessFromV1ToV2Recur} because a sub-protocol node is reached
   * through {@link migrateNodesFromV1ToV2}, which has already migrated its process type: recursing
   * with the whole-process migration re-read `human_name` and `short_description` after they had
   * been deleted, and so overwrote the node's `process_type` with two `undefined` fields.
   */
  private migrateGraphFromV1ToV2(process: any): void {
    if (!process.graph) {
      return;
    }

    this.migrateNodesFromV1ToV2(process.graph.nodes);

    if (process.graph.interfaces) {
      this.migrateInterfacesFromV1ToV2(process.graph.interfaces);
    }

    if (process.graph.outerfaces) {
      this.migrateOuterfacesFromV1ToV2(process.graph.outerfaces);
    }
  }

  /**
   * Move the human name and the description of a process into its process type
   */
  private migrateProcessTypeFromV1ToV2(process: any): void {
    if (!process.name) {
      process.name = process.human_name;
    }

    process.process_type = {
      human_name: process.human_name,
      short_description: process.short_description,
    };

    delete process.human_name;
    delete process.short_description;
  }

  private migrateNodesFromV1ToV2(nodes: any): void {
    for (const key in nodes) {
      const process = nodes[key];
      this.migrateProcessTypeFromV1ToV2(process);
      // its own process type is done: a sub-protocol only has its graph left to migrate
      this.migrateGraphFromV1ToV2(process);
    }
  }

  private migrateInterfacesFromV1ToV2(interfaces: any): void {
    for (const key in interfaces) {
      const inter = interfaces[key];
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

  private migrateOuterfacesFromV1ToV2(outerfaces: any): void {
    for (const key in outerfaces) {
      const outerface = outerfaces[key];
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

  // to keep until all labs are V 0.7.5 or higher
  private migrateProtocolFromV2ToV3(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const newProtocolData = this.migrateProcessFromV2ToV3Recur(protocol.data);
    return {
      version: 3,
      data: newProtocolData,
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
