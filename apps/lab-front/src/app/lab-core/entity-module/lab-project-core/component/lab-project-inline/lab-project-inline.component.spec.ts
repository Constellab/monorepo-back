import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabProjectInlineComponent } from './lab-project-inline.component';

describe('LabProjectInlineComponent', () => {
  let component: LabProjectInlineComponent;
  let fixture: ComponentFixture<LabProjectInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProjectInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabProjectInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
