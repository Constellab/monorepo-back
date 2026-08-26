import { CnProtocolMigrator } from './cn-protocol-migrator.class';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';

/**
 * A V1 protocol whose root holds one plain process and one sub-protocol, the sub-protocol holding
 * a process of its own. `as any` because a V1 protocol predates the typed V3 shape.
 */
function v1Protocol(): CnScenarioProtocol {
  return {
    version: 1,
    data: {
      human_name: 'Root protocol',
      short_description: 'the whole scenario',
      graph: {
        nodes: {
          plain: {
            human_name: 'A plain process',
            short_description: 'does one thing',
          },
          sub: {
            human_name: 'A sub protocol',
            short_description: 'holds other processes',
            graph: {
              nodes: {
                nested: {
                  human_name: 'A nested process',
                  short_description: 'inside the sub protocol',
                },
              },
            },
          },
        },
        interfaces: {
          source: { to: { node: 'plain', port: 'in' }, from: { node: 'x', port: 'out' } },
        },
        outerfaces: {
          sink: { from: { node: 'plain', port: 'out' }, to: { node: 'y', port: 'in' } },
        },
      },
    },
  } as any;
}

describe('CnProtocolMigrator', () => {
  let migrator: CnProtocolMigrator;

  beforeEach(() => {
    migrator = new CnProtocolMigrator();
  });

  describe('V1 to V2', () => {
    it('moves the human name and description of the root into its process type', () => {
      const data = migrator.migrateProtocol(v1Protocol()).data as any;

      expect(data.process_type).toEqual({
        human_name: 'Root protocol',
        short_description: 'the whole scenario',
      });
      expect(data.name).toBe('Root protocol');
      expect('human_name' in data).toBe(false);
      expect('short_description' in data).toBe(false);
    });

    it('moves the human name and description of a plain process into its process type', () => {
      const data = migrator.migrateProtocol(v1Protocol()).data as any;

      expect(data.graph.nodes.plain.process_type).toEqual({
        human_name: 'A plain process',
        short_description: 'does one thing',
      });
    });

    /**
     * The regression this file exists for: a sub-protocol node was migrated by the node loop, then
     * recursed into with the whole-process migration, which re-read `human_name` and
     * `short_description` after they had been deleted and overwrote `process_type` with
     * `{ human_name: undefined, short_description: undefined }`.
     */
    it('keeps the process type of a sub-protocol node it recurses into', () => {
      const data = migrator.migrateProtocol(v1Protocol()).data as any;

      expect(data.graph.nodes.sub.process_type).toEqual({
        human_name: 'A sub protocol',
        short_description: 'holds other processes',
      });
      expect(data.graph.nodes.sub.name).toBe('A sub protocol');
    });

    it('migrates the processes held inside a sub-protocol', () => {
      const data = migrator.migrateProtocol(v1Protocol()).data as any;

      expect(data.graph.nodes.sub.graph.nodes.nested.process_type).toEqual({
        human_name: 'A nested process',
        short_description: 'inside the sub protocol',
      });
    });

    it('rewrites interfaces onto the process instance they name', () => {
      const data = migrator.migrateProtocol(v1Protocol()).data as any;

      expect(data.graph.interfaces.source).toEqual({
        process_instance_name: 'plain',
        port_name: 'in',
      });
    });

    it('rewrites outerfaces onto the process instance they name', () => {
      const data = migrator.migrateProtocol(v1Protocol()).data as any;

      expect(data.graph.outerfaces.sink).toEqual({
        process_instance_name: 'plain',
        port_name: 'out',
      });
    });

    it('keeps a name the process already carries', () => {
      const protocol = v1Protocol();
      (protocol.data as any).name = 'an explicit name';

      const data = migrator.migrateProtocol(protocol).data as any;

      expect(data.name).toBe('an explicit name');
    });
  });

  describe('V2 to V3', () => {
    it('splits the brick version into the create and run versions, at every depth', () => {
      const protocol = {
        version: 2,
        data: {
          graph: {
            nodes: {
              plain: { brick_version: '1.2.3' },
              sub: { graph: { nodes: { nested: { brick_version: '4.5.6' } } } },
            },
          },
        },
      } as any;

      const data = migrator.migrateProtocol(protocol).data as any;

      expect(data.graph.nodes.plain).toEqual({
        brick_version_on_create: '1.2.3',
        brick_version_on_run: '1.2.3',
      });
      expect(data.graph.nodes.sub.graph.nodes.nested).toEqual({
        brick_version_on_create: '4.5.6',
        brick_version_on_run: '4.5.6',
      });
    });
  });

  it('walks a V1 protocol all the way to V3', () => {
    const result = migrator.migrateProtocol(v1Protocol());

    expect(result.version).toBe(3);
  });

  it('leaves a V3 protocol untouched', () => {
    const protocol = { version: 3, data: { name: 'already migrated' } } as any;

    expect(migrator.migrateProtocol(protocol)).toEqual(protocol);
  });
});
