import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdProcessDocComponent} from './td-process-doc.component';

describe('TdTaskDocViewComponent', () => {
  let component: TdProcessDocComponent;
  let fixture: ComponentFixture<TdProcessDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdProcessDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdProcessDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
