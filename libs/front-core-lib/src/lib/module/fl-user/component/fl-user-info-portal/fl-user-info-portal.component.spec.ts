import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlUserInfoPortalComponent} from './fl-user-info-portal.component';

describe('FlUserInfoPortalComponent', () => {
  let component: FlUserInfoPortalComponent;
  let fixture: ComponentFixture<FlUserInfoPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlUserInfoPortalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlUserInfoPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
