import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdIoResourceViewComponent} from './td-io-resource-view.component';

describe('TdIoResourceViewComponent', () => {
  let component: TdIoResourceViewComponent;
  let fixture: ComponentFixture<TdIoResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdIoResourceViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdIoResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
