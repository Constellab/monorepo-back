import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlArticleLeftSideComponent} from './fl-article-left-side.component';

describe('FlArticleLeftSideComponent', () => {
  let component: FlArticleLeftSideComponent;
  let fixture: ComponentFixture<FlArticleLeftSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlArticleLeftSideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlArticleLeftSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
