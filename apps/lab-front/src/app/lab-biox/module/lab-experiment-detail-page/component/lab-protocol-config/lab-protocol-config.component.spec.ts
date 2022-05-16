import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProtocolConfigComponent} from './lab-protocol-config.component';

describe('LabProtocolConfigComponent', () => {
  let component: LabProtocolConfigComponent;
  let fixture: ComponentFixture<LabProtocolConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProtocolConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProtocolConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
