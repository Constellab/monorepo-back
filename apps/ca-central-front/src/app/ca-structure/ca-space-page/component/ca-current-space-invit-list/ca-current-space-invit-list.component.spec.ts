import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceInvitListComponent} from './ca-current-space-invit-list.component';

describe('CaSpaceInvitListComponent', () => {
  let component: CaCurrentSpaceInvitListComponent;
  let fixture: ComponentFixture<CaCurrentSpaceInvitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceInvitListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceInvitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
