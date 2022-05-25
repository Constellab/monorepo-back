import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdMainDocComponent} from './td-main-doc.component';

describe('TdMainDocView.ComponentComponent', () => {
  let component: TdMainDocComponent;
  let fixture: ComponentFixture<TdMainDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdMainDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdMainDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
