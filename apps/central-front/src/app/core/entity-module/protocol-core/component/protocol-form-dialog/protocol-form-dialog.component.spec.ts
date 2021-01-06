import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProtocolFormDialogComponent} from './protocol-form-dialog.component';

describe('ProtocolFormDialogComponent', () => {
  let component: ProtocolFormDialogComponent;
  let fixture: ComponentFixture<ProtocolFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocolFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
