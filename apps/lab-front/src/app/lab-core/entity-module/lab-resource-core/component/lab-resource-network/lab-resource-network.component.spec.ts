import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceNetworkComponent} from './lab-resource-network.component';

describe('BioxResourceNetworkComponent', () => {
  let component: LabResourceNetworkComponent;
  let fixture: ComponentFixture<LabResourceNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceNetworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
