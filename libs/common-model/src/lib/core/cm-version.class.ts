import {Transform} from 'class-transformer';
import {ClTransformFnParams} from '@monorepo/core-lib';

/**
 * Object to support version like 2.1.1 or 2.2.0-beta.1
 */
export class CmVersion {

  constructor(public major: number, public minor: number, public patch: number, public subPatch?: number) {
  }

  public static fromString(version: string): CmVersion {
    if (version == null || version.length < 5) {
      throw new Error(`Version '${version}' is invalid`);
    }

    const versions = version.split('.');
    if (versions.length !== 3 && version.length !== 4) {
      throw new Error(`Version '${version}' is invalid`);
    }

    // main version contain version before sub patch like 1.1.1
    let mainVersionsStr = version;

    // if there is a sub-patch, extract it
    let subPatch: number = null;
    if(version.includes('-beta.')){
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

    return new CmVersion(major, minor, patch, subPatch);
  }

  public isEqualOrHigher(other: CmVersion): boolean {
    return this.getDif(other) >= 0;
  }

  private getDif(other: CmVersion): number {
    if (this.major === other.major &&
      this.minor === other.minor &&
      this.patch === other.patch &&
      this.getSubPatchAsNumber() === other.getSubPatchAsNumber()) {
      return 0;
    }

    if (this.major > other.major ||
      (this.major === other.major && this.minor > other.minor) ||
      (this.major === other.major && this.minor === other.minor && this.patch > other.patch) ||
      (this.major === other.major && this.minor === other.minor && this.patch === other.patch &&
        this.getSubPatchAsNumber() > other.getSubPatchAsNumber())) {
      return 1;
    } else {
      return -1;
    }
  }

  public isBeta(): boolean {
    return this.subPatch != null;
  }

  public getSubPatchAsNumber(): number {
    return this.subPatch != null ? this.subPatch : -1;
  }

  public toString(): string {
    return this.isBeta() ? [this.major, this.minor, this.patch].join('.') + '-beta.' + this.subPatch
      : [this.major, this.minor, this.patch].join('.');
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
