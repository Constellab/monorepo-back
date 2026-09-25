import { BlBadRequestException } from '@monorepo/back-core-lib';

import { CnCoreConfigService } from '../../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCommandService } from '../../../cn-core/services/cn-command.service';
import { CnCloudProviderOvhService } from './cn-cloud-provider-ovh.service';
import { CnOvhDomainZone } from './cn-ovh.class';
import { CnOvhService } from './cn-ovh.service';

/**
 * A lab domain is not always the apex of an OVH zone: 'lab.constellab.acme.com' lives in
 * the zone 'acme.com'. These tests cover that the records land in the right zone, under
 * the right name — calling /domain/zone/<lab domain> answers "This service does not exist".
 */
describe('CnOvhDomainZone.find', () => {
  const zones = ['acme.com', 'constellab.app', 'gencovery.io'];

  it('uses the domain itself when it is a zone', () => {
    const zone = CnOvhDomainZone.find(zones, 'constellab.app');

    expect(zone).toEqual(new CnOvhDomainZone('constellab.app', ''));
    expect(zone?.getRecordName('*.abc')).toBe('*.abc');
  });

  it('finds the parent zone of a subdomain and keeps the rest as a prefix', () => {
    const zone = CnOvhDomainZone.find(zones, 'lab.constellab.acme.com');

    expect(zone).toEqual(new CnOvhDomainZone('acme.com', 'lab.constellab'));
    expect(zone?.getRecordName('*.abc')).toBe('*.abc.lab.constellab');
  });

  it('prefers the most specific zone', () => {
    const zone = CnOvhDomainZone.find([...zones, 'constellab.acme.com'], 'lab.constellab.acme.com');

    expect(zone).toEqual(new CnOvhDomainZone('constellab.acme.com', 'lab'));
  });

  it('does not match a zone that is only a string suffix', () => {
    expect(CnOvhDomainZone.find(['me.com'], 'acme.com')).toBeNull();
  });

  it('ignores case and a trailing dot', () => {
    expect(CnOvhDomainZone.find(['Acme.com'], 'LAB.acme.com.')).toEqual(
      new CnOvhDomainZone('acme.com', 'lab')
    );
  });
});

describe('CnCloudProviderOvhService DNS', () => {
  let service: CnCloudProviderOvhService;
  let ovhService: {
    getDomainZones: jest.Mock;
    createDomainRecord: jest.Mock;
    getDomainRecordIdBySubDomain: jest.Mock;
    deleteDomainRecord: jest.Mock;
  };

  beforeEach(() => {
    ovhService = {
      getDomainZones: jest.fn().mockResolvedValue(['conidia-coniphy.com', 'constellab.app']),
      createDomainRecord: jest.fn().mockResolvedValue({}),
      getDomainRecordIdBySubDomain: jest.fn().mockResolvedValue([12, 13]),
      deleteDomainRecord: jest.fn().mockResolvedValue(undefined),
    };
    service = new CnCloudProviderOvhService(
      ovhService as unknown as CnOvhService,
      {} as CnCoreConfigService,
      {} as CnCommandService
    );
  });

  it('writes the host record in the parent zone of the lab domain', async () => {
    await service.createLabDomainHostRecord('1.2.3.4', 'lab.constellab.conidia-coniphy.com', 'uuid');

    expect(ovhService.createDomainRecord).toHaveBeenCalledWith('conidia-coniphy.com', {
      fieldType: 'A',
      subDomain: '*.uuid.lab.constellab',
      target: '1.2.3.4',
    });
  });

  it('writes the challenge record in the parent zone of the lab domain', async () => {
    await service.createDnsChallengeForLab('lab.constellab.conidia-coniphy.com', 'uuid', 'token');

    expect(ovhService.createDomainRecord).toHaveBeenCalledWith(
      'conidia-coniphy.com',
      expect.objectContaining({ subDomain: '_acme-challenge.uuid.lab.constellab', fieldType: 'TXT' })
    );
  });

  it('deletes the records found under the prefixed name, in the zone', async () => {
    await service.deleteLabDomainHostRecord('lab.constellab.conidia-coniphy.com', 'uuid');

    expect(ovhService.getDomainRecordIdBySubDomain).toHaveBeenCalledWith(
      'conidia-coniphy.com',
      '*.uuid.lab.constellab',
      'A'
    );
    expect(ovhService.deleteDomainRecord).toHaveBeenCalledWith('conidia-coniphy.com', 12);
    expect(ovhService.deleteDomainRecord).toHaveBeenCalledWith('conidia-coniphy.com', 13);
  });

  it('keeps the record name unchanged when the lab domain is a zone', async () => {
    await service.createLabDomainHostRecord('1.2.3.4', 'constellab.app', 'uuid');

    expect(ovhService.createDomainRecord).toHaveBeenCalledWith(
      'constellab.app',
      expect.objectContaining({ subDomain: '*.uuid' })
    );
  });

  it('lists the zones once per domain', async () => {
    await service.deleteLabDomainHostRecord('constellab.app', 'a');
    await service.deleteDnsChallengeForLab('constellab.app', 'b');

    expect(ovhService.getDomainZones).toHaveBeenCalledTimes(1);
  });

  it('refuses a lab domain that no zone of the account contains, and retries next time', async () => {
    await expect(service.createLabDomainHostRecord('1.2.3.4', 'other.com', 'uuid')).rejects.toThrow(
      BlBadRequestException
    );
    expect(ovhService.createDomainRecord).not.toHaveBeenCalled();

    ovhService.getDomainZones.mockResolvedValue(['other.com']);
    await service.createLabDomainHostRecord('1.2.3.4', 'other.com', 'uuid');

    expect(ovhService.createDomainRecord).toHaveBeenCalledWith('other.com', expect.anything());
  });
});
