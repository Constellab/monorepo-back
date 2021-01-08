import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSectionActionsComponent} from './fl-section-actions.component';

describe('SectionListActionComponent', () => {
  let component: FlSectionActionsComponent;
  let fixture: ComponentFixture<FlSectionActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSectionActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSectionActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
