import {CmVersion} from '@monorepo/common-model';


test('Test version', () => {
  const version = CmVersion.fromString('1.0.0');
  expect(version.major).toBe(1);
  expect(version.minor).toBe(0);
  expect(version.patch).toBe(0);
  expect(version.toString()).toBe('1.0.0');

  const versionBeta = CmVersion.fromString('1.0.0-beta.1');
  expect(versionBeta.major).toBe(1);
  expect(versionBeta.minor).toBe(0);
  expect(versionBeta.patch).toBe(0);
  expect(versionBeta.subPatch).toBe(1);
  expect(versionBeta.toString()).toBe('1.0.0-beta.1');

});


test('Test version comparaison', () => {
  const version1 = CmVersion.fromString('1.0.0');
  const version2 = CmVersion.fromString('2.0.0');
  const versionMinor1 = CmVersion.fromString('1.1.0');
  const versionPatch1 = CmVersion.fromString('1.0.1');
  const versionBeta = CmVersion.fromString('1.0.0-beta.1');

  expect(version1.isEqual(version1)).toBeTruthy();
  expect(version2.isEqualOrHigher(version1)).toBeTruthy();
  expect(versionMinor1.isEqualOrHigher(version1)).toBeTruthy();
  expect(versionPatch1.isEqualOrHigher(version1)).toBeTruthy();
  expect(version1.isEqualOrHigher(versionBeta)).toBeTruthy();
});
