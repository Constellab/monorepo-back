import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceUpdateNameDialogComponent} from './ca-lab-instance-update-name-dialog.component';

describe('LabInstanceUpdateNameDialogComponent', () => {
  let component: CaLabInstanceUpdateNameDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceUpdateNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceUpdateNameDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceUpdateNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
