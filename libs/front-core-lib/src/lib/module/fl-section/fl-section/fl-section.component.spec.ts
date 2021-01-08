import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSectionComponent} from './fl-section.component';

describe('SectionListComponent', () => {
  let component: FlSectionComponent;
  let fixture: ComponentFixture<FlSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
