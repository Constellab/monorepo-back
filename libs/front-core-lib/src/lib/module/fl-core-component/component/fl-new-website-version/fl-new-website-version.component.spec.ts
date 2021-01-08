import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlNewWebsiteVersionComponent} from './fl-new-website-version.component';

describe('NewWebsiteVersionComponent', () => {
  let component: FlNewWebsiteVersionComponent;
  let fixture: ComponentFixture<FlNewWebsiteVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlNewWebsiteVersionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlNewWebsiteVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
