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

  public toString(): string {
    return [this.major, this.minor, this.patch].join('.');
  }

}
