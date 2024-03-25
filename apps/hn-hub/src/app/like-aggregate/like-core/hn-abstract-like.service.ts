export abstract class HnAbstractLikeService<T> {
  abstract like(entityId: string): Promise<T>;

  abstract unlike(entityId: string): Promise<T>;

  abstract checkIfLiked(entityId: string): Promise<boolean>;
}
