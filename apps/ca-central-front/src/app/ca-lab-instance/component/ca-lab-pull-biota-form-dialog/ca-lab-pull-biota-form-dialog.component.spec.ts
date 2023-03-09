import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaLabPullBiotaFormDialogComponent } from './ca-lab-pull-biota-form-dialog.component';

describe('CaLabPullBiotaFormDialogComponent', () => {
  let component: CaLabPullBiotaFormDialogComponent;
  let fixture: ComponentFixture<CaLabPullBiotaFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabPullBiotaFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabPullBiotaFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
