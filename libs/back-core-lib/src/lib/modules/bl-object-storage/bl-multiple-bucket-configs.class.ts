import { BlAzureBlobContainerConfig, BlBucketConfig, BlS3BucketConfig } from './bl-object-storage.class';

export class BlMultipleBucketConfig {
  constructor(public bucketConfigs: BlBucketConfig[]) {}

  public countCloudBuckets(): number {
    return this.bucketConfigs.filter((config) => config.type !== 'lab').length;
  }

  public countLabBuckets(): number {
    return this.bucketConfigs.filter((config) => config.type === 'lab').length;
  }

  public containsOnlyLabBuckets(): boolean {
    return this.bucketConfigs.every((config) => config.type === 'lab');
  }

  public containsCloudBuckets(): boolean {
    return this.bucketConfigs.some((config) => config.type !== 'lab');
  }

  public getFirstBucket(): BlBucketConfig {
    return this.bucketConfigs[0];
  }

  public equals(other: BlMultipleBucketConfig): boolean {
    if (this.bucketConfigs.length !== other.bucketConfigs.length) return false;

    for (let i = 0; i < this.bucketConfigs.length; i++) {
      const find = other.bucketConfigs.find((config) => this.bucketsAreEquals(this.bucketConfigs[i], config));
      if (!find) return false;
    }

    return true;
  }

  public bucketsAreEquals(config1: BlBucketConfig, config2: BlBucketConfig): boolean {
    if (config1.type !== config2.type) return false;
    if (config1.type === 'azureBlob') {
      return this.azureBlobBucketAreEqual(
        config1.config as BlAzureBlobContainerConfig,
        config2.config as BlAzureBlobContainerConfig
      );
    } else {
      return this.s3BucketAreEqual(config1.config as BlS3BucketConfig, config2.config as BlS3BucketConfig);
    }
  }

  private azureBlobBucketAreEqual(
    config1: BlAzureBlobContainerConfig,
    config2: BlAzureBlobContainerConfig
  ): boolean {
    return (
      config1.accountName === config2.accountName &&
      config1.containerName === config2.containerName &&
      config1.region === config2.region
    );
  }

  private s3BucketAreEqual(config1: BlS3BucketConfig, config2: BlS3BucketConfig): boolean {
    return (
      config1.region === config2.region &&
      config1.endpoint === config2.endpoint &&
      config1.bucket === config2.bucket &&
      config1.bucketType === config2.bucketType
    );
  }
}
