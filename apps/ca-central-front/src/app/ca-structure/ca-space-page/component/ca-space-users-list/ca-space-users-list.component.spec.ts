import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceUsersListComponent} from './ca-space-users-list.component';

describe('CaSpaceUsersListComponent', () => {
  let component: CaSpaceUsersListComponent;
  let fixture: ComponentFixture<CaSpaceUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceUsersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSpaceUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
