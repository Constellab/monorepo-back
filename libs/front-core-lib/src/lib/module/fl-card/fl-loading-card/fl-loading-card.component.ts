import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'fl-loading-card',
  templateUrl: './fl-loading-card.component.html',
  styleUrls: ['./fl-loading-card.component.scss']
})
export class FlLoadingCardComponent implements OnInit {

  @Input() numberOfBodyLines: number = 2;

  bodyLines: null[];

  constructor() { }

  ngOnInit(): void {
    this.bodyLines = Array(this.numberOfBodyLines).fill(null);
  }

}
