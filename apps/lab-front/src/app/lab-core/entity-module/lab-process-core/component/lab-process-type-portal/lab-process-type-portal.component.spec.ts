import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessTypePortalComponent} from './lab-process-type-portal.component';

describe('BioxProcessTypePortalComponent', () => {
  let component: LabProcessTypePortalComponent;
  let fixture: ComponentFixture<LabProcessTypePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessTypePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessTypePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
