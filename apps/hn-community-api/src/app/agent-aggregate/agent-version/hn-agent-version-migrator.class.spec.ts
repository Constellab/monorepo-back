import { HnAgentVersionDto } from './hn-agent-version.dto';
import { HnAgentVersionMigrator } from './hn-agent-version-migrator.class';

/** An agent version whose params are in whichever format the case under test needs. */
function agentVersion(params: HnAgentVersionDto['params']): HnAgentVersionDto {
  return { params } as HnAgentVersionDto;
}

const V3_PARAMS = {
  specs: {
    threshold: { type: 'float', optional: false },
    label: { type: 'str', optional: false },
  },
  values: { threshold: 0.5, label: 'a name' },
};

describe('HnAgentVersionMigrator', () => {
  let migrator: HnAgentVersionMigrator;

  beforeEach(() => {
    migrator = new HnAgentVersionMigrator();
  });

  /**
   * The regression this file exists for. `migrateAgentVersionToSpecificVersion` used to replace
   * params with an empty `{ specs, values }` whenever `specs` was absent — which is to say for
   * every agent version still stored in a pre-v3 format. The params were emptied, and because
   * `specs` was set from then on, the branches written to convert those formats were unreachable.
   */
  describe('params still stored in a legacy format', () => {
    it('keeps a v1 list of entries when asked for v1', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion(['threshold=0.5', 'label=a name']),
        1
      );

      expect(result.params).toEqual(['threshold=0.5', 'label=a name']);
    });

    it('converts a v1 list of entries to the v2 newline string', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion(['threshold=0.5', 'label=a name']),
        2
      );

      expect(result.params).toBe('threshold=0.5\nlabel=a name');
    });

    it('converts a v1 list of entries to the v3 specs and values', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion(['threshold=0.5', 'label=a name']),
        3
      );

      expect(result.params).toEqual(V3_PARAMS);
    });

    it('converts a v2 newline string to the v1 list of entries', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion('threshold=0.5\nlabel=a name'),
        1
      );

      expect(result.params).toEqual(['threshold=0.5', 'label=a name']);
    });

    it('keeps a v2 newline string when asked for v2', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion('threshold=0.5\nlabel=a name'),
        2
      );

      expect(result.params).toBe('threshold=0.5\nlabel=a name');
    });

    it('converts a v2 newline string to the v3 specs and values', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion('threshold=0.5\nlabel=a name'),
        3
      );

      expect(result.params).toEqual(V3_PARAMS);
    });
  });

  describe('params already in the v3 format', () => {
    it('flattens them to the v1 list of entries', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(agentVersion(V3_PARAMS), 1);

      expect(result.params).toEqual(['threshold=0.5', 'label=a name']);
    });

    it('flattens them to the v2 newline string', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(agentVersion(V3_PARAMS), 2);

      expect(result.params).toBe('threshold=0.5\nlabel=a name\n');
    });

    it('normalises a legacy `string` spec type to `str`', () => {
      const params = { specs: { label: { type: 'string' } }, values: { label: 'a name' } };

      const result = migrator.migrateAgentVersionToSpecificVersion(agentVersion(params), 3);

      expect((result.params as Record<string, any>).specs.label.type).toBe('str');
    });
  });

  describe('params carrying nothing readable', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['an empty string', ''],
      ['an object with no specs', {}],
    ])('defaults %s to empty specs and values when asked for v3', (_label, params) => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion(params as HnAgentVersionDto['params']),
        3
      );

      expect(result.params).toEqual({ specs: {}, values: {} });
    });

    it('defaults null to an empty list when asked for v1', () => {
      const result = migrator.migrateAgentVersionToSpecificVersion(
        agentVersion(null as unknown as HnAgentVersionDto['params']),
        1
      );

      expect(result.params).toEqual([]);
    });
  });

  describe('specs flags renamed in v3', () => {
    it('renames is_optional and is_constant on the input and output specs', () => {
      const dto = {
        params: V3_PARAMS,
        inputSpecs: { specs: { source: { is_optional: true } } },
        outputSpecs: { specs: { target: { is_constant: true } } },
      } as unknown as HnAgentVersionDto;

      const result = migrator.migrateAgentVersionToSpecificVersion(dto, 3);

      expect(result.inputSpecs?.specs.source).toEqual({ optional: true });
      expect(result.outputSpecs?.specs.target).toEqual({ constant: true });
    });
  });

  it('leaves an unknown target version untouched', () => {
    const result = migrator.migrateAgentVersionToSpecificVersion(agentVersion(V3_PARAMS), 4);

    expect(result.params).toEqual(V3_PARAMS);
  });
});
