import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'da-da-public-doc-page',
  templateUrl: './da-public-doc-page.component.html',
  styleUrls: ['./da-public-doc-page.component.scss']
})
export class DaPublicDocPageComponent implements OnInit {

  route: string;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(url => {
      url.shift();
      this.route = url.join('/');
      console.log(this.route);
    });
  }

}
