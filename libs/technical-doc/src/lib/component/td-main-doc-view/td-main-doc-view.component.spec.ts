import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdMainDocViewComponent} from './td-main-doc-view.component';

describe('TdMainDocView.ComponentComponent', () => {
  let component: TdMainDocViewComponent;
  let fixture: ComponentFixture<TdMainDocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdMainDocViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdMainDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
