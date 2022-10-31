import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbFormDialogComponent} from './ca-smart-db-form-dialog.component';

describe('CaSmartDbFormDialogComponent', () => {
  let component: CaSmartDbFormDialogComponent;
  let fixture: ComponentFixture<CaSmartDbFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSmartDbFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
