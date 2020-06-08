import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  dept = null;
  info = null;
  admin = null;
  seg2 = null;
  menuOpened = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router
) { }

  ngOnInit() {
    this.info = this.route.snapshot.url[0].path || null;
    this.admin = this.route.snapshot.url[0].path || null;
    this.seg2 = this.route.snapshot.url[0].path  || null;

  }
  isConsult() {
    return !this.isInfo() &&
     !this.isBillable() &&
     !this.isWard() &&
     !this.isAdmin();
  }
  toggleMainMenu() {
    this.menuOpened = (this.menuOpened) ? false : true;
    console.log(this.menuOpened);
  }
  getClass() {
    return (this.menuOpened) ? 'opened' : 'closed';
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isMessages() {
    return this.router.url.includes('messages');
  }
  isInfo() {
    return this.router.url.includes('information');
  }
  isWard() {
    return this.router.url.includes('ward');
  }
  isVisible() {
    return !this.router.url.includes('pharmacy') || !this.router.url.includes('billing');
  }
  isPharmacy() {
    return this.router.url.includes('pharmacy');
  }

  isBillable() {
    return this.router.url.split('/')[1] === 'pharmacy' ||
    this.router.url.split('/')[1] === 'billing' ||
    this.router.url.split('/')[1] === 'lab';
  }

}
