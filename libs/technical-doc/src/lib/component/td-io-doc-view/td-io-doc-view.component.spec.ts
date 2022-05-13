import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdIoDocViewComponent} from './td-io-doc-view.component';

describe('TdIoDocViewComponent', () => {
  let component: TdIoDocViewComponent;
  let fixture: ComponentFixture<TdIoDocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdIoDocViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdIoDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
