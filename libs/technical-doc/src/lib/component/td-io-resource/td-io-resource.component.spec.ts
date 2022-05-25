import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdIoResourceComponent} from './td-io-resource.component';

describe('TdIoResourceViewComponent', () => {
  let component: TdIoResourceComponent;
  let fixture: ComponentFixture<TdIoResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdIoResourceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdIoResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
