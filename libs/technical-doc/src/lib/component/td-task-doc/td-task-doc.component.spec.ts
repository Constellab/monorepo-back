import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTaskDocComponent} from './td-task-doc.component';

describe('TdTaskDocViewComponent', () => {
  let component: TdTaskDocComponent;
  let fixture: ComponentFixture<TdTaskDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdTaskDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTaskDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
