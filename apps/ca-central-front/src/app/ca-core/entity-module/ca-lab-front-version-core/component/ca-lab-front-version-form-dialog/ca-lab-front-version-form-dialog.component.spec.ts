import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabFrontVersionFormDialogComponent} from './ca-lab-front-version-form-dialog.component';

describe('CaLabFrontVersionFormDialogComponent', () => {
  let component: CaLabFrontVersionFormDialogComponent;
  let fixture: ComponentFixture<CaLabFrontVersionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabFrontVersionFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabFrontVersionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
