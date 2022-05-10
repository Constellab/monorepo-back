import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamFormDialogComponent} from './ca-team-form-dialog.component';

describe('CaGroupFormDialogComponent', () => {
  let component: CaTeamFormDialogComponent;
  let fixture: ComponentFixture<CaTeamFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaTeamFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
