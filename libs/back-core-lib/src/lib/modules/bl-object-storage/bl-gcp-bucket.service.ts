import { BlS3BucketService } from './bl-s3-bucket.service';

export class BlGcpBucketService extends BlS3BucketService {
  /**
   * The delete multiple objects method is not
   * supported by GCP. So we need to delete each object
   * @param objectNames
   */
  async deleteMultipleObjects(objectNames: string[]): Promise<void> {
    for (const objectName of objectNames) {
      await this.deleteObjectIfExists(objectName);
    }
  }
}
