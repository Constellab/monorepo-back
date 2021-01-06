import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NewWebsiteVersionComponent} from './new-website-version.component';

describe('NewWebsiteVersionComponent', () => {
  let component: NewWebsiteVersionComponent;
  let fixture: ComponentFixture<NewWebsiteVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewWebsiteVersionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWebsiteVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
