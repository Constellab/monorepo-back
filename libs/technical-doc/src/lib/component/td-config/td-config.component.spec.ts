import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdConfigComponent } from './td-config.component';

describe('TdConfigComponent', () => {
  let component: TdConfigComponent;
  let fixture: ComponentFixture<TdConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TdConfigComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
