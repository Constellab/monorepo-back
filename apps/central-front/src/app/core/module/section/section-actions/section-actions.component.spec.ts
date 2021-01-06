import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SectionActionsComponent} from './section-actions.component';

describe('SectionListActionComponent', () => {
  let component: SectionActionsComponent;
  let fixture: ComponentFixture<SectionActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
