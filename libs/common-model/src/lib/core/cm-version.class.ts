import {Transform} from 'class-transformer';
import {ClTransformFnParams} from '@monorepo/core-lib';

export class CmVersion {

  constructor(public major: number, public minor: number, public patch: number) {
  }

  public static fromString(version: string): CmVersion {
    if (version == null || version.length < 5) {
      throw new Error(`Version '${version}' is invalid`);
    }

    const versions = version.split('.');
    if (versions.length !== 3) {
      throw new Error(`Version '${version}' is invalid`);
    }

    const major = parseInt(versions[0]);
    const minor = parseInt(versions[1]);
    const patch = parseInt(versions[2]);

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw new Error(`Version '${version}' is invalid`);
    }

    return new CmVersion(major, minor, patch);
  }

  public isEqualOrHigher(other: CmVersion): boolean {
    return this.getVersionAsNumber() >= other.getVersionAsNumber();
  }

  public toString(): string {
    return [this.major, this.minor, this.patch].join('.');
  }

  private getVersionAsNumber(): number {
    return parseInt('' + this.major + this.minor + this.patch);
  }

}

export function CmVersionTransform(): PropertyDecorator {
  // convert Version to string
  const transformToPlain = Transform(
    (params: ClTransformFnParams<CmVersion>) => params.value?.toString() ?? null,
    {toPlainOnly: true});

  // create string to Version
  const transformToClass = Transform(
    (params: ClTransformFnParams<string | null>) => params.value == null ? null : CmVersion.fromString(params.value),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
