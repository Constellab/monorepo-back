import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTechnicalDocHeaderComponent} from './td-technical-doc-header.component';

describe('TdTechnicalDocHeaderComponent', () => {
  let component: TdTechnicalDocHeaderComponent;
  let fixture: ComponentFixture<TdTechnicalDocHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdTechnicalDocHeaderComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTechnicalDocHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
