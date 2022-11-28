import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {CaNewUser, CaUser} from '../model/entities/ca-user.class';
import {Observable} from 'rxjs';
import {
  CaSpaceInvit,
  CaSpaceInvitDTO,
  CaSpaceInvitFull
} from '../model/entities/ca-space-invit.class';

@Injectable({
  providedIn: 'root'
})
export class CaSpaceInvitService {

  private readonly route = 'space-invit';

  constructor(private apiService: FlApiService) {
  }

  /**
   * Public route to accept an invitation when a new user is registered
   * @param code
   * @param user
   */
  public acceptInvitationNewUser(code: string, user: CaNewUser): Observable<CaUser> {
    delete user.repeatPassword;
    return this.apiService.post(`${this.route}/code/${code}/accept-new-user`, user, CaUser);
  }

  public getInvitationByCode(code: string): Observable<CaSpaceInvitFull> {
    return this.apiService.get(`${this.route}/code/${code}`, CaSpaceInvitFull);
  }

  public acceptInvitationExistingUser(code: string): Observable<CaUser> {
    return this.apiService.post(`${this.route}/code/${code}/accept-existing-user`, null, CaUser);
  }

  public createInvitation(spaceId: string, invitDto: CaSpaceInvitDTO): Observable<CaSpaceInvit> {
    return this.apiService.post(`${this.route}/${spaceId}`, invitDto, CaSpaceInvit);
  }

  public resendInvitation(invitId: string): Observable<void> {
    return this.apiService.put(`${this.route}/${invitId}/resend`, null);
  }

  public refreshInvitationValidUntil(invitId: string): Observable<CaSpaceInvit> {
    return this.apiService.put(`${this.route}/${invitId}/refresh-validity`, null, CaSpaceInvit);
  }

  public updateInvitationRole(invitId: string, role: string): Observable<CaSpaceInvit> {
    return this.apiService.put(`${this.route}/${invitId}/role/${role}`, null, CaSpaceInvit);
  }

  public deleteInvitation(invitId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${invitId}`);
  }
}
