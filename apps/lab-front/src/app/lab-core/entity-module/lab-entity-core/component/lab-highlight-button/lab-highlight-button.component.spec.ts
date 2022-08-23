import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabHighlightButtonComponent} from './lab-highlight-button.component';

describe('LabHighlightButtonComponent', () => {
  let component: LabHighlightButtonComponent;
  let fixture: ComponentFixture<LabHighlightButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabHighlightButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabHighlightButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
