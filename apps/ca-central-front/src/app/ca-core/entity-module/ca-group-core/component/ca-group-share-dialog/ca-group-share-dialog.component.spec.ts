import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaGroupShareDialogComponent} from './ca-group-share-dialog.component';

describe('CaGroupShareDialogComponent', () => {
  let component: CaGroupShareDialogComponent;
  let fixture: ComponentFixture<CaGroupShareDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaGroupShareDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGroupShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
