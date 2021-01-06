import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MyProtocolsPageComponent} from './my-protocols-page.component';

describe('MyProtocolsPageComponent', () => {
  let component: MyProtocolsPageComponent;
  let fixture: ComponentFixture<MyProtocolsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyProtocolsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProtocolsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
