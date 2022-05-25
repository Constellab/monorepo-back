import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTechnicalDocComponent} from './td-technical-doc.component';

describe('TdTechnicalDocViewComponent', () => {
  let component: TdTechnicalDocComponent;
  let fixture: ComponentFixture<TdTechnicalDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdTechnicalDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTechnicalDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
