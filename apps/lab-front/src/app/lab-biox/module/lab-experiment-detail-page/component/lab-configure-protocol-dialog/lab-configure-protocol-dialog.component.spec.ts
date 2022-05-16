import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureProtocolDialogComponent} from './lab-configure-protocol-dialog.component';

describe('LabConfigureProtocolDialogComponent', () => {
  let component: LabConfigureProtocolDialogComponent;
  let fixture: ComponentFixture<LabConfigureProtocolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureProtocolDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureProtocolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
