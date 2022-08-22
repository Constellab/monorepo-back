import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSyncObjectButtonComponent} from './lab-sync-object-button.component';

describe('LabSyncObjectButtonComponent', () => {
  let component: LabSyncObjectButtonComponent;
  let fixture: ComponentFixture<LabSyncObjectButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSyncObjectButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSyncObjectButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
