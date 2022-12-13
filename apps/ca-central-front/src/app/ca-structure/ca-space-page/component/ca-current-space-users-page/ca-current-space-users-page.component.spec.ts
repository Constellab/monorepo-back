import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceUsersPageComponent} from './ca-current-space-users-page.component';

describe('CaCurrentSpaceUsersPageComponent', () => {
  let component: CaCurrentSpaceUsersPageComponent;
  let fixture: ComponentFixture<CaCurrentSpaceUsersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceUsersPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
