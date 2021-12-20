import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceIframeComponent} from './ca-lab-instance-iframe.component';

describe('LabInstanceIframeComponent', () => {
  let component: CaLabInstanceIframeComponent;
  let fixture: ComponentFixture<CaLabInstanceIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceIframeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
