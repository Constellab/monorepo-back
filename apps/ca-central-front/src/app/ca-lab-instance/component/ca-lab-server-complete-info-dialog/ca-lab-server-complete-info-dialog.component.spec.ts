import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabServerCompleteInfoDialogComponent} from './ca-lab-server-complete-info-dialog.component';

describe('CaLabServerCompleteInfoDialogComponent', () => {
  let component: CaLabServerCompleteInfoDialogComponent;
  let fixture: ComponentFixture<CaLabServerCompleteInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabServerCompleteInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabServerCompleteInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
