import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessDocComponent} from './lab-process-doc.component';

describe('BioxProcessTypeDocComponent', () => {
  let component: LabProcessDocComponent;
  let fixture: ComponentFixture<LabProcessDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
