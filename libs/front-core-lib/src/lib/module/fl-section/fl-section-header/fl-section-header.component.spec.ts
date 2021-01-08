import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSectionHeaderComponent} from './fl-section-header.component';

describe('SectionListHeaderComponent', () => {
  let component: FlSectionHeaderComponent;
  let fixture: ComponentFixture<FlSectionHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSectionHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
