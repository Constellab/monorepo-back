import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceFormDialogComponent} from './ca-space-form-dialog.component';

describe('CaSpaceFormDialogComponent', () => {
  let component: CaSpaceFormDialogComponent;
  let fixture: ComponentFixture<CaSpaceFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSpaceFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
