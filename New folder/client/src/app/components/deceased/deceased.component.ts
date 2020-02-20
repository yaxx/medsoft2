import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import sorter from '../../util/functions';
import {ActivatedRoute,Router} from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';
import {Person, Info} from '../../models/person.model';
import {Visit} from '../../models/record.model';
import {Client, Department} from '../../models/client.model';
import {CookieService } from 'ngx-cookie-service';
import {host} from '../../util/url';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-deceased',
  templateUrl: './deceased.component.html',
  styleUrls: ['./deceased.component.css']
})
export class DeceasedComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  clonedPatient: Person = new Person();
  patient: Person = new Person();
  client: Client = new Client();
  file: File = null;
  info: Info = new Info();
  visit: Visit = new Visit();
  card: string = null;
  url = '';
  logout = false;
  curIndex = 0;
  message = null;
  feedback = null;
  processing = false;
  sortBy = 'added';
  page = 0;
  sortMenu = false;
  loading = false;
  nowSorting = 'Date Added';
  view = 'info';
  searchTerm = '';
  uploader: FileUploader = new FileUploader({url: uri});
  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private socket: SocketService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.getPatients('Deceased');
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  getDp(avatar: String) {
    return `${host}/api/dp/${avatar}`;
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  refresh() {
    this.message = null;
    this.getPatients('Deceased');
  }
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
  });
}
getPatients(type) {
  this.loading = (this.page === 0) ? true : false;
  this.dataService.getPatients(type, this.page).subscribe((patients: Person[]) => {
    if (patients.length) {
      patients.forEach(p => {
        p.card = {menu: false, view: 'front'};
      });
      this.patients   = [...this.patients, ...patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime())];
      this.clonedPatients  = [...this.clonedPatients, ...patients];
      this.loading = false;
      this.message = null;
      ++this.page;
    } else {
        this.message = (this.page === 0) ? 'No Records So Far' : null;
        this.loading = false;
    }
  }, (e) => {
    this.loading = false;
    this.patients = [];
    this.message = '...Network Error';
  });
}
loadMore() {
  if(this.page > 0) {
    this.getPatients('Deceased');
  }
}
  searchPatient(name: string) {
    if(name!==''){
     this.patients = this.patients.filter((patient) => {
       const patern =  new RegExp('\^' + name
       , 'i');
       return patern.test(patient.info.personal.firstName);
       });
    } else {
      this.patients = this.clonedPatients;
    }
  }
  logOut() {
    this.dataService.logOut();
  }
  showLogOut() {
    this.logout = true;
  }
  hideLogOut() {
    this.logout = false;
  }
   getMe() {
     return this.cookies.get('a');
   }
}
