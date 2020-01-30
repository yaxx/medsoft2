
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Person, Info} from '../../models/person.model';
import {Visit , Appointment} from '../../models/record.model';
import {states, lgas } from '../../data/states';
import {CookieService } from 'ngx-cookie-service';
import * as cloneDeep from 'lodash/cloneDeep';
import {host} from '../../util/url';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  clonedPatient: Person = new Person();
  patient: Person = new Person();
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
                this.patients[i] = { ...update.patient, card: this.patients[i].card };
              }
              break;
        }
      });
  }
   getDp(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
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
   searchPatient(name:string) {
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

   sortPatients(sortOption: string) {
     this.sortMenu = false;
     switch (sortOption) {
       case 'name':
         this.patients.sort((m: Person, n: Person) => m.info.personal.firstName.localeCompare(n.info.personal.firstName));
         this.nowSorting = 'A-Z';
         break;
       case 'sex':
         this.patients.sort((m: Person, n: Person) => n.info.personal.gender.localeCompare(m.info.personal.gender));
         this.nowSorting = 'Gender';
         break;
         case 'age':
         this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());
         this.nowSorting = 'Age';
         break;
       case 'date':
         this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
         this.nowSorting = 'Date';
         break;
         default:
         break;
     }
   }
}
