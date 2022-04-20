import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigSearchFormComponent} from './lab-view-config-search-form.component';

describe('LabViewConfigSearchFormComponent', () => {
  let component: LabViewConfigSearchFormComponent;
  let fixture: ComponentFixture<LabViewConfigSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabViewConfigSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
