import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdResourceDocViewComponent} from './td-resource-doc-view.component';

describe('TdResourceDocViewComponent', () => {
  let component: TdResourceDocViewComponent;
  let fixture: ComponentFixture<TdResourceDocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdResourceDocViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdResourceDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
