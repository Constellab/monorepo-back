import { TestBed } from '@angular/core/testing';

import { CaNotificationsService } from './ca-notifications.service';

describe('CaNotificationsService', () => {
  let service: CaNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
