import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BiotaDataCardDialogComponent} from './biota-data-card-dialog.component';

describe('BiotaDataCardDialogComponent', () => {
  let component: BiotaDataCardDialogComponent;
  let fixture: ComponentFixture<BiotaDataCardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDataCardDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDataCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
