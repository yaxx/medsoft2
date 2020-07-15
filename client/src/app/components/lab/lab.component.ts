import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person} from '../../models/person.model';
import {sorter, searchPatients} from '../../util/functions';
import {CookieService} from 'ngx-cookie-service';
import {Meta} from '../../models/inventory.model';
import {Report} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { timeout } from 'q';
import {host, appName} from '../../util/url';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})
export class LabComponent implements OnInit {
  appName = appName;
  patients: Person[] = [];
  reserved: Person[] = [];
  pool: Person[] = [];
  clonedPatients: Person[] = [];
  patient: Person = new Person();
  url = null;
  requests = [];
  file: File = null;
  inlineProducts = [];
  uploader: FileUploader = new FileUploader({url: uri});
  images: any = [];
  allFiles: any = [];
  report = new Report();
  formData =  new FormData();
  transMsg = null;
  errMsg = null;
  sucssMsg = null;
  input = '';
  logout = false;
  searchTerm = '';
  cardView = {
    orders: true,
    report: false,
    reversing: false
  };
  testIndex = {
    i: 0,
    j: 0
  };
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date';
  view = 'default';
  count = 0;
  page = 0;
  id = '';
  selected = null;
  curIndex = 0;
  loading = false;
  processing = false;
  message = null;
  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private router: Router,
    private socket: SocketService
    ) { }

  ngOnInit() {
    this.getPatients();
    this.socket.io.on('record update', (update) => {
      const i = this.patients.findIndex(p => p._id === update.patient._id);
      switch (update.action) {
        case 'payment':
            if (update.card.some(prod => prod.type === 'Services')) {
                if (!this.router.url.includes('completed')) {
                  if (i !== -1) {
                    this.patients[i] = { ...update.patient, card: { ...this.patients[i].card, indicate: true } };
                  } else {
                    this.patients.unshift({ ...update.patient, card: { menu: false, view: 'front', indicate: true } });
                  }
                } else if (i !== -1) {
                  this.patients.splice(i, 1);
                  this.message = ( this.patients.length) ? null : 'No Record So Far';
                }
            }
            break;
        default:
            if (i !== -1 ) {
              this.patients[i] = { ...update.patient, card: this.patients[i].card };
            }
            break;
      }
    });
  }
  populate(patients) {
    this.pool = patients;
    this.clonedPatients  = patients;
    this.patients   = patients.slice(0, 12);
    patients.splice(0, 12);
    this.reserved = patients;
  }
  getPatients(type?:string) {
    this.loading = (this.page === 0) ? true : false;
    this.dataService.getPatients(type, this.page).subscribe((patients: Person[]) => {
      if (patients.length) {
        patients.forEach(p => {
          p.card = {menu: false, view: 'front'};
        });
        this.populate(patients);
        this.loading = false;
        this.message = null;
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
  onScroll() {
    this.page = this.page + 1;
    if(this.reserved.length) {
      if(this.reserved.length >  12 ) {
        this.patients = [...this.patients, ...this.reserved.slice(0, 12)];
        this.reserved.splice(0,  12);
      } else {
        this.patients = [...this.patients, ...this.reserved];
        this.reserved = [];
      }
    }
  }
  getBackgrounds() {
    const url = this.getMyDp();
    return {
      backgroundImage: `url(${url})`,
    };
  }
  clear() {
    this.sucssMsg = null;
    this.errMsg = null;
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  searchPatient(name: string) {
    if (name !== '') {
     this.patients = this.patients.filter((patient) => {
       const patern =  new RegExp('\^' + name , 'i');
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
  getDp(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  selectItem(i: number, j: number) {
    this.testIndex = {
      i: i, j: j
    };
    this.requests.forEach(request => {
      request.forEach(r => {
        r.meta.selected = (r.meta.selected) ?  false : false;
      });
    });
    this.requests[i][j].meta.selected =  true;
   }
   deSelectItem(i, j) {
    this.testIndex = {
      i: 0, j: 0
    };
    this.requests[i][j].meta.selected = false;
   }
  itemSelected() {
    return this.requests.some(request => request.some(r => r.meta.selected));
  }
   openRequests(i) {
     this.curIndex = i;
     this.patient = cloneDeep(this.patients[i]);
     this.requests = [
       ...this.patient.record.tests.filter(test => test.dept !== this.cookies.get('dept')),
       ...this.patient.record.scans.filter(scan => scan.dept !== this.cookies.get('dept'))
      ];
     this.switchViews('orders');
   }
   switchToReport() {
     this.cardView.report = true;
   }
   switchViews(view) {
    switch (view) {
      case 'orders':
      this.cardView.orders = true;
      this.cardView.report = false;
      this.cardView.reversing = false;
      break;
      case 'report':
      this.cardView.orders = false;
      this.cardView.report = true;
      this.cardView.reversing = false;
      break;
      case 'reversing':
      this.cardView.orders = false;
      this.cardView.report = false;
      this.cardView.reversing = true;
      break;
      default:
      break;
    }
  }
  fileSelected(event: any) {
    const files  = event.target.files;
    if(files) {
      for (const img of files) {
        this.formData.append('files', img);
      }
      for (let i = 0; i < files.length; i++) {
        const image = {
          name: '',
          type: '',
          size : '',
          url : ''
        };
        this.allFiles.push(files[i]);
        image.name = files[i].name;
        image.type = files[i].type;
        image.size = files[i].size;
        image.url = files[i].url;
        const reader = new FileReader();
        reader.onload = (e) => {
          const ev = <any>e; // called once readAsDataURL is completed
          image.url = ev.target.result;
          this.images.push(image);
        };
        reader.readAsDataURL(files[i]);
      }
      event.srcElement.value  = null;
    }
  }
  reset() {
    setTimeout(() => {
      this.sucssMsg = null;
    }, 3000);
    setTimeout(() => {
      this.allFiles = [];
      this.report = new Report();
      this.switchViews('orders');
    }, 4000);
  }
  sortPatients(order: string) {
    this.sortMenu = false;
    this.nowSorting = order;
    this.patients = sorter(this.patients, order)
  }
  sendReport(res) {
    for (const file of res) {
      this.report.attachments.push(file.filename);
    }
    this.report.meta = new Meta(this.cookies.get('i'));
    this.patient.record.tests = this.patient.record.tests.map(tests => tests.map(t =>
       (t._id === this.requests[this.testIndex.i][this.testIndex.j]._id) ? ({
         ...t, report: this.report, treated: true}) : t
       ));
    this.patient.record.scans = this.patient.record.scans.map(scans => scans.map(s =>
       (s._id === this.requests[this.testIndex.i][this.testIndex.j]._id) ? ({
         ...s, report: this.report, treated: true}) : s
       ));

    this.dataService.updateRecord(this.patient).subscribe((patient: Person) => {
      this.processing = false;
      this.socket.io.emit('record update', {action: 'new report', patient});
      this.patients[this.curIndex] = patient;
      this.sucssMsg = 'Report Posted Successfull';
      this.reset();
    }, (e) => {
      this.processing = false;
      this.errMsg = 'Unable to post report';
    });
  }
  postReport() {
    this.processing = true;
    this.dataService.uploadScans(this.formData).subscribe((res) => {
     this.sendReport(res);
    }, (e) => {
      this.processing = false;
      this.errMsg = 'Unable to post report';
    });
  }
  refresh() {
    this.message = null;
    this.getPatients();
  }
}
