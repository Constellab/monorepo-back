import { BlS3BucketService } from './bl-s3-bucket.service';

/**
 * An s3 service that does not support batch delete (OVH and GCP)
 */
export class BlNoBatchDeleteBucketService extends BlS3BucketService {
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
