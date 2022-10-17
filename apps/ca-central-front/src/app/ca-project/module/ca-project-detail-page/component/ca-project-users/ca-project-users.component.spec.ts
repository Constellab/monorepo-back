import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectUsersComponent} from './ca-project-users.component';

describe('CaProjectUsersComponent', () => {
  let component: CaProjectUsersComponent;
  let fixture: ComponentFixture<CaProjectUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
