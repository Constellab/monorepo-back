import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceUpdateDialogComponent} from './ca-lab-instance-update-dialog.component';

describe('LabInstanceUpdateNameDialogComponent', () => {
  let component: CaLabInstanceUpdateDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceUpdateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
