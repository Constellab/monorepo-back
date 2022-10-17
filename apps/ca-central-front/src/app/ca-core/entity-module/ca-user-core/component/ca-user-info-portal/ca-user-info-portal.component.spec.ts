import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserInfoPortalComponent} from './ca-user-info-portal.component';

describe('CaUserInfoPortalComponent', () => {
  let component: CaUserInfoPortalComponent;
  let fixture: ComponentFixture<CaUserInfoPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaUserInfoPortalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaUserInfoPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
