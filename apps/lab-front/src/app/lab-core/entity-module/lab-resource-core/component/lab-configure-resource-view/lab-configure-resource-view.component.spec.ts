import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureResourceViewComponent} from './lab-configure-resource-view.component';

describe('BioxConfigureResourceViewComponent', () => {
  let component: LabConfigureResourceViewComponent;
  let fixture: ComponentFixture<LabConfigureResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureResourceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
