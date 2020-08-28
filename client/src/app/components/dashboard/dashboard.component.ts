import { Component, OnInit } from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bpChart = [];
  topDrugs = [];
  iSource = [];
  inFlux = [];
  chartData = [15000, 85000, 60000, 75000, 35000, 20000, 10000];
  constructor() { }

  ngOnInit() {


  }
}
