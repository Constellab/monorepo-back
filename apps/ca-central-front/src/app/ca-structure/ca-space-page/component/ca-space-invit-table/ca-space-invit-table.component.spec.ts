import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceInvitTableComponent} from './ca-space-invit-table.component';

describe('CaSpaceInvitTableComponent', () => {
  let component: CaSpaceInvitTableComponent;
  let fixture: ComponentFixture<CaSpaceInvitTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceInvitTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceInvitTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
