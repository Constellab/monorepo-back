import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBrickVersionDetailDialogComponent} from './ca-brick-version-detail-dialog.component';

describe('CaBrickVersionDetailDialogComponent', () => {
  let component: CaBrickVersionDetailDialogComponent;
  let fixture: ComponentFixture<CaBrickVersionDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBrickVersionDetailDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaBrickVersionDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
