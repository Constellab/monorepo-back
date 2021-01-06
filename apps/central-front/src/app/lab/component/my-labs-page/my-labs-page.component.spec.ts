import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MyLabsPageComponent} from './my-labs-page.component';

describe('MyLabsPageComponent', () => {
  let component: MyLabsPageComponent;
  let fixture: ComponentFixture<MyLabsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyLabsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyLabsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
