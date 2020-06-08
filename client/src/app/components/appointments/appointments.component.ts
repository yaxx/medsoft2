
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Person, Info} from '../../models/person.model';
import {Client, Department} from '../../models/client.model';
import {Visit , Appointment} from '../../models/record.model';
import {states, lgas } from '../../data/states';
import {CookieService } from 'ngx-cookie-service';
import { Record,  Session} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import {host, appName} from '../../util/url';
import {sorter, searchPatients} from '../../util/functions';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  appName = appName;
  temp: Person[] = [];
  pool: Person[] = [];
  reserved: Person[] = [];
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  clonedPatient: Person = new Person();
  client: Client = new Client();
  cardTypes = [];
  patient: Person = new Person();
  session: Session = new Session();
   file: File = null;
   info: Info = new Info();
   url = '';
   logout = false;
   curIndex = 0;
   page = 0;
   successMsg =  null;
   errorMsg =  null;
   lgas = lgas;
   states = states;
   count = 0;
   sortBy = 'added';
   cardCount = null;
   sortMenu = false;
   loading = false;
   myDepartment = null;
   processing = false;
   nowSorting = 'Date';
   view = 'info';
   updating  = false;
   message = null;
   feedback = null;
   searchTerm = '';
   regMode =  'all';
   dept = null;
  //  dpurl = 'http://localhost:5000/api/dp/';
   dpurl = 'http://192.168.1.100:5000/api/dp/';
   appointment: Appointment = new Appointment();
   uploader: FileUploader = new FileUploader({url: uri});
   constructor(
     private dataService: DataService,
     private cookies: CookieService,
     private route: ActivatedRoute,
     private router: Router,
     private socket: SocketService
  ) { }

   ngOnInit() {
      this.myDepartment = this.route.snapshot.url[0].path;
      this.getPatients('ap');
      this.getClient();
      this.socket.io.on('record update', (update) => {
        const i = this.patients.findIndex(p => p._id === update.patient._id);
        switch (update.action) {
          case 'disposition':
               if (update.patient.records.visits[0][0].status === 'ap') {
                this.patients.unshift({ ...update.patient, card: { ...this.patients[i].card, indicate: true } });
              }
               break;
          default:
              if (i !== -1 ) {
                this.patients[i] = {
                  ...update.patient,
                   card: this.patients[i].card
                  };
              }
              break;
        }
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
   getDp(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
  });
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
   setAppointment() {
    this.processing = true;
    this.patients[this.curIndex].record.appointments[0] = this.appointment;
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe(patient => {
      this.processing = false;
      this.feedback = 'Appointment updated';
      setTimeout(() => {
        this.feedback = null;
        this.patients[this.curIndex].card = {menu: false, view: 'front'};
      }, 3000);
    });
  }
  getRefDept() {
    return this.client.departments.filter(dept => dept.hasWard && dept.name !== this.dept);
  }

  dispose(i: number, disposition: string, label) {
    this.patients[i].record.visits[0][0].status = disposition;
    this.patients[i].card.btn = label;
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isInfo() {
      return this.router.url.includes('information');
    }
    isConsult() {
      return !this.router.url.includes('information') &&
      !this.router.url.includes('pharmacy') &&
      !this.router.url.includes('billing') &&
      !this.router.url.includes('ward') &&
      !this.router.url.includes('admin');
  }
  queue(i) {
    this.patients[this.curIndex].record.visits[0][0].status = 'queued';
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe(patient => {
      this.patients[this.curIndex].card = {menu: false, view: 'front'};
      this.patients.splice(this.curIndex , 1);
    });
  }
  switchCards(i: number, face: string) {
    this.patients[this.curIndex].card.view = 'front';
    this.curIndex = i;
    this.patients[i].record.visits[0][0].status = 'out';
    this.patients[i].card.view = face;
    switch (face) {
       case 'ap':
       this.cardCount = 'dispose';
       break;
       case 'appointment':
       this.cardCount = 'ap';
       break;
       case 'dispose':
       this.cardCount = 'dispose';
       this.patients[i].card.btn = 'discharge';
       this.dept = this.patients[i].record.visits[0][0].dept;
       break;
       default:
       this.cardCount = null;
       this.patients[i].record.visits[0][0].status = 'queued';
       this.patients[i].record.visits[0][0].dept = this.dept;
       this.patients[i].card.btn = 'discharge';
       break;
     }
   }
  comfirmDesposition(i: number) {
    this.processing = true;
    this.patients[i].record.visits[0][0].dept = (this.patients[i].record.visits[0][0].status !== 'queued')
       ? this.dept : this.patients[i].record.visits[0][0].dept;
    this.patients[i].record.visits[0][0].dischargedOn = new Date();
    this.dataService.updateRecord(this.patients[i], this.session.newItems).subscribe((p: Person) => {
    this.processing = false;
    this.socket.io.emit('record update', {action: 'disposition', patient: this.patients[i]});
    this.successMsg = 'Success';
    setTimeout(() => {
      this.successMsg = null;
    }, 5000);
    setTimeout(() => {
      this.switchCards(i, 'front');
    }, 8000);
    setTimeout(() => {
      this.patients.splice(i, 1);
      this.message = ( this.patients.length) ? null : 'No Record So Far';
    }, 10000);
  }, (e) => {
    this.errorMsg = '...Network Error';
    this.processing = false;
  });
}
populate(patients) {
  this.pool = patients;
  this.clonedPatients  = cloneDeep(patients);
  this.patients   = patients.slice(0, 12);
  patients.splice(0, 12);
  this.reserved = patients;
}
getPatients(type?: string) {
  this.loading = (this.page === 0) ? true : false;
  this.dataService.getPatients(type, this.page)
  .subscribe((patients: Person[]) => {
    if (patients.length) {
      patients.forEach(p => {
        p.card = {
          menu: false,
          view: 'front',
          more: false
        };
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
   loadMore() {
  //   if(this.page > 0) {
  //     this.getPatients('Appointment');
  // }
  }
   fileSelected(event) {
     if (event.target.files && event.target.files[0]) {
       this.file = <File>event.target.files[0];
       const reader = new FileReader();
       reader.readAsDataURL(event.target.files[0]); // read file as data url
       reader.onload = (e) => {
         let evnt = <any>e;
         this.url = evnt.target.result;
       };
     }

   }
   showMenu(i: number) {
    this.hideMenu();
    this.patients[i].card.menu = true;
  }
  refresh() {
    this.message = null;
    this.getPatients('Appointment');
  }
  hideMenu() {
    this.patients.forEach(p => {
      p.card.menu =  false;
    });
  }

   switchCardView(i , view) {
    this.patients[this.curIndex].card.view = 'front';
    this.curIndex = i;
    this.cardCount = view;
    this.patients[i].card.view = view;
    this.patient = cloneDeep(this.patients[i]);
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
   selectPatient(i: number) {
     this.info = this.patients[i].info;
   }

   submitRecord() {
     this.loading = true;
     this.patient.info = this.info;
     this.uploader.uploadAll();
   }
   switchViews() {
     if (this.view === 'details') {
        this.view = '';
     } else {
       this.view = 'details';
     }
   }
   searchPatient(name: string) {
    if (!this.temp.length) {
      this.temp = cloneDeep(this.patients);
    }
    if (name.length) {
      this.patients = searchPatients(this.clonedPatients, name);
      if(!this.patients.length) {
        this.message = '...No record found';
      }
   } else {
      this.patients = this.temp;
      this.temp = [];
   }
  }
   withoutCard() {
    return (this.patient.info.personal.firstName) &&
    (this.patient.info.personal.lastName) &&
    (this.patient.info.personal.dob);
  }
  isValidInfo() {
    return this.withoutCard();
  }
  isValidContact() {
      return (this.patient.info.contact.emergency.mobile);
  }
  isInvalidForm() {
    return !(this.isValidInfo());
  }
  next() {
    this.count = this.count + 1;
  }
  prev() {
    this.count = this.count - 1;
  }
  getLgas() {
    return this.lgas[this.states.indexOf(this.patient.info.contact.me.state)];
  }
   viewDetails(i) {
    this.curIndex = i;
    this.count = 0;
    this.patient = cloneDeep(this.patients[i]);
  }
  clearError() {
    this.errorMsg = null;
  }
  updateInfo() {
    this.dataService.updateInfo(this.patient.info, this.patient._id).subscribe((info: Info) => {
      this.successMsg = 'Update Sucessfull';
      this.patient.info = info;
      this.patients[this.curIndex].info =  info;
      this.processing = false;
      this.socket.io.emit('record update', {action: '', patient: this.patient});
      setTimeout(() => {
        this.successMsg = null;
      }, 3000);
    }, (e) => {
     this.processing = false;
     this.errorMsg = 'Update failed';
   });
  }

   sortPatients(order: string) {
    this.sortMenu = false;
    this.nowSorting = order;
    this.patients = sorter(this.patients, order)
  }
}
