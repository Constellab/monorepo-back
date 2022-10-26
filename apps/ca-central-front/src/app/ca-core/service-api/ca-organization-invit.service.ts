import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {CaNewUser, CaUser} from '../model/entities/ca-user.class';
import {Observable} from 'rxjs';
import {
  CaOrganizationInvit,
  CaOrganizationInvitDTO,
  CaOrganizationInvitFull
} from '../model/entities/ca-organization-invit.class';

@Injectable({
  providedIn: 'root'
})
export class CaOrganizationInvitService {

  private readonly route = 'organization-invit';

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

  public getInvitationByCode(code: string): Observable<CaOrganizationInvitFull> {
    return this.apiService.get(`${this.route}/code/${code}`, CaOrganizationInvitFull);
  }

  public acceptInvitationExistingUser(code: string): Observable<CaUser> {
    return this.apiService.post(`${this.route}/code/${code}/accept-existing-user`, null, CaUser);
  }

  public createInvitation(organizationId: string, invitDto: CaOrganizationInvitDTO): Observable<CaOrganizationInvit> {
    return this.apiService.post(`${this.route}/${organizationId}`, invitDto, CaOrganizationInvit);
  }

  public resendInvitation(invitId: string): Observable<void> {
    return this.apiService.put(`${this.route}/${invitId}/resend`, null);
  }

  public refreshInvitationValidUntil(invitId: string): Observable<CaOrganizationInvit> {
    return this.apiService.put(`${this.route}/${invitId}/refresh-validity`, null, CaOrganizationInvit);
  }

  public updateInvitationRole(invitId: string, role: string): Observable<CaOrganizationInvit> {
    return this.apiService.put(`${this.route}/${invitId}/role/${role}`, null, CaOrganizationInvit);
  }

  public deleteInvitation(invitId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${invitId}`);
  }
}
