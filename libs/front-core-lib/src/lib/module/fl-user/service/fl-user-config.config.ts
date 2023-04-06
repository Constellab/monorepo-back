import {FlUser} from '../model/fl-user.class';
import {FlDatasourcePaginated} from '../../../model/datasource/fl-datasource-paginated.class';
import {Observable} from 'rxjs';

/**
 * AllForAdmin --> show all user only for G admin user otherwise space
 */
export type FlUserConfigSearchNameMode = 'all' | 'space' | 'allForAdmin';

export abstract class FlUserConfig {
  public abstract getUserPhotoUrl(photoUrl: string): string;

  public abstract getUserDetailRoute(userId: string): string;

  /**
   * Use by the {@link FlSelectUserComponent} to get the user by id
   */
  public abstract getUserById(userId: string): Observable<FlUser>;

  /**
   * Use by the {@link FlSelectUserComponent} to search users by name
   */
  public abstract getSearchByNamesDatasource(mode: FlUserConfigSearchNameMode): FlDatasourcePaginated<FlUser>;

  /**
   * Use by the {@link FlSelectUserComponent} to get the current user
   */
  public abstract getAuthenticatedUser(): FlUser;
}
