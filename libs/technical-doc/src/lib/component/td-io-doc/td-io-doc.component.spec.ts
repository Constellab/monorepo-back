import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdIoDocComponent} from './td-io-doc.component';

describe('TdIoDocViewComponent', () => {
  let component: TdIoDocComponent;
  let fixture: ComponentFixture<TdIoDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdIoDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdIoDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
