import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTaskDocViewComponent} from './td-task-doc-view.component';

describe('TdTaskDocViewComponent', () => {
  let component: TdTaskDocViewComponent;
  let fixture: ComponentFixture<TdTaskDocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdTaskDocViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTaskDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
