import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceInvitListComponent} from './ca-space-invit-list.component';

describe('CaSpaceInvitListComponent', () => {
  let component: CaSpaceInvitListComponent;
  let fixture: ComponentFixture<CaSpaceInvitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceInvitListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceInvitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
