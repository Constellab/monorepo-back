import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlInputSearchComponent} from './fl-input-search.component';

describe('FlInputSearchComponent', () => {
  let component: FlInputSearchComponent;
  let fixture: ComponentFixture<FlInputSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlInputSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlInputSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
