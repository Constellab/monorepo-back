import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaLabManagerUpdateDialogComponent } from './ca-lab-manager-update-dialog.component';

describe('CaLabManagerUpdateDialogComponent', () => {
  let component: CaLabManagerUpdateDialogComponent;
  let fixture: ComponentFixture<CaLabManagerUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabManagerUpdateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabManagerUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
