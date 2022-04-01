import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDataCardDialogComponent} from './lab-biota-data-card-dialog.component';

describe('BiotaDataCardDialogComponent', () => {
  let component: LabBiotaDataCardDialogComponent;
  let fixture: ComponentFixture<LabBiotaDataCardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDataCardDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDataCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
