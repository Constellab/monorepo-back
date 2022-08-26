import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigTabComponent} from './lab-view-config-tab.component';

describe('LabViewConfigTabComponent', () => {
  let component: LabViewConfigTabComponent;
  let fixture: ComponentFixture<LabViewConfigTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewConfigTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
