import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTechnicalDocViewComponent} from './td-technical-doc-view.component';

describe('TdTechnicalDocViewComponent', () => {
  let component: TdTechnicalDocViewComponent;
  let fixture: ComponentFixture<TdTechnicalDocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdTechnicalDocViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTechnicalDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
