import { ClTransformFnParams } from '@monorepo/core-lib';
import { Transform } from 'class-transformer';

/**
 * Object to support version like 2.1.1 or 2.2.0-beta.1
 */
export class BlVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public subPatch?: number
  ) {}

  public static fromString(version: string): BlVersion {
    if (version == null || version.length < 5) {
      throw new Error(`Version '${version}' is invalid`);
    }

    const versions = version.split('.');
    if (versions.length !== 3 && versions.length !== 4) {
      throw new Error(`Version '${version}' is invalid`);
    }

    // main version contain version before sub patch like 1.1.1
    let mainVersionsStr = version;

    // if there is a sub-patch, extract it
    let subPatch: number = null;
    if (version.includes('-beta.')) {
      let subPatchStr: string;
      [mainVersionsStr, subPatchStr] = version.split('-beta.');

      subPatch = parseInt(subPatchStr);
      if (isNaN(subPatch)) {
        throw new Error(`Sub-patch version of '${version}' is invalid`);
      }
    }

    // extract other versions
    const mainVersions = mainVersionsStr.split('.');

    const major = parseInt(mainVersions[0]);
    const minor = parseInt(mainVersions[1]);
    const patch = parseInt(mainVersions[2]);

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw new Error(`Version '${version}' is invalid`);
    }

    return new BlVersion(major, minor, patch, subPatch);
  }

  public isGreaterThanOrEqualTo(other: BlVersion): boolean {
    return this.getDif(other) >= 0;
  }

  public isEqual(other: BlVersion): boolean {
    return this.getDif(other) === 0;
  }

  public isLowerThan(other: BlVersion): boolean {
    return this.getDif(other) < 0;
  }
  /**
   * Returns the difference between this version and another version
   * === 0 if equal
   * 1 if this version is higher
   * -1 if other version is higher
   * @param other
   */
  public getDif(other: BlVersion): number {
    if (
      this.major === other.major &&
      this.minor === other.minor &&
      this.patch === other.patch &&
      this.getSubPatchAsNumber() === other.getSubPatchAsNumber()
    ) {
      return 0;
    }

    if (
      this.major > other.major ||
      (this.major === other.major && this.minor > other.minor) ||
      (this.major === other.major && this.minor === other.minor && this.patch > other.patch) ||
      (this.major === other.major &&
        this.minor === other.minor &&
        this.patch === other.patch &&
        this.getSubPatchAsNumber() > other.getSubPatchAsNumber())
    ) {
      return 1;
    } else {
      return -1;
    }
  }

  public isBeta(): boolean {
    return this.subPatch != null;
  }

  /**
   * Return the subPatch as a number.
   * If there is no subPatch, return Infinity, so it is greater than beta version
   */
  public getSubPatchAsNumber(): number {
    return this.subPatch != null ? this.subPatch : Infinity;
  }

  public toString(): string {
    return this.isBeta()
      ? [this.major, this.minor, this.patch].join('.') + '-beta.' + this.subPatch
      : [this.major, this.minor, this.patch].join('.');
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlVersionTransform(): PropertyDecorator {
  // convert Version to string
  const transformToPlain = Transform(
    (params: ClTransformFnParams<BlVersion>) => params.value?.toString() ?? null,
    { toPlainOnly: true }
  );

  // create string to Version
  const transformToClass = Transform(
    (params: ClTransformFnParams<string | null>) =>
      params.value == null ? null : BlVersion.fromString(params.value),
    { toClassOnly: true }
  );

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
