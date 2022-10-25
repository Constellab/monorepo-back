import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaNotificationsPortalComponent} from './ca-notifications-portal.component';

describe('CaNotificationsDivComponent', () => {
  let component: CaNotificationsPortalComponent;
  let fixture: ComponentFixture<CaNotificationsPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaNotificationsPortalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaNotificationsPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
