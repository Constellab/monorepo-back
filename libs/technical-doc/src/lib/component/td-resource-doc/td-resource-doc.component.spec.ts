import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdResourceDocComponent} from './td-resource-doc.component';

describe('TdResourceDocViewComponent', () => {
  let component: TdResourceDocComponent;
  let fixture: ComponentFixture<TdResourceDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdResourceDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdResourceDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
