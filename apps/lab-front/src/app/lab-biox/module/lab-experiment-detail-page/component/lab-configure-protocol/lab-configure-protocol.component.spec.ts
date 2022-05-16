import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureProtocolComponent} from './lab-configure-protocol.component';

describe('LabConfigureProtocolComponent', () => {
  let component: LabConfigureProtocolComponent;
  let fixture: ComponentFixture<LabConfigureProtocolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureProtocolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureProtocolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
