export abstract class FlUserConfig{
  public abstract getUserPhotoUrl(userId: string): string;

  public abstract getUserDetailRoute(userId: string): string;
}
