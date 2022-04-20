import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigSearchComponent} from './lab-view-config-search.component';

describe('LabViewConfigSearchComponent', () => {
  let component: LabViewConfigSearchComponent;
  let fixture: ComponentFixture<LabViewConfigSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabViewConfigSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
