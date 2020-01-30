import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import * as cloneDeep from 'lodash/cloneDeep';
import {CookieService} from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person, Info} from '../../models/person.model';
import {Tests, Scannings, Surgeries} from '../../data/request';
import {Client, Department} from '../../models/client.model';
import {Conditions} from '../../data/conditions';
import {states, lgas } from '../../data/states';
import {PersonUtil} from '../../util/person.util';
import { Item, StockInfo, Product, Card, Invoice, Meta} from '../../models/inventory.model';
import {Subject} from 'rxjs';
import {Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {host} from '../../util/url';
import { Record,  Session} from '../../models/record.model';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
  tests = Tests;
  scannings = Scannings;
  surgeries = Surgeries;
  conditions = Conditions;
  patient: Person = new Person();
  patients: Person[] = [];
  products: Product[] = [];
  clonedPatient: Person = new Person();
  clonedPatients: Person[] = [];
  record: Record = new Record();
  card: Card = new Card();
  cardTypes = [];
  client: Client = new Client();
  department: Department = new Department();
  session: Session = new Session();
  lgas = lgas;
  states = states;
  curIndex = 0;
  searchTerm = '';
  medicView = false;
  selectedProducts: Product[] = [];
  input = '';
  in = 'discharge';
  loading  = false;
  processing  = false;
  feedback = null;
  reg = true;
  sortBy = 'added';
  logout = false;
  updating = false;
  sortMenu = false;
  message = null;
  cardCount = null;
  page = 0;
  showPhotoMenu = false;
  nowSorting = 'Date';
  myDepartment = null;
  errLine = null;
  successMsg =  null;
  errorMsg =  null;
  showWebcam = false;
  errors: WebcamInitError[] = [];
  webcamImage: WebcamImage = null;
  count = 0;
  dept = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  url = null;
  file: File = null;
  uploader: FileUploader = new FileUploader({url: uri});
  constructor(
     private dataService: DataService,
     private route: ActivatedRoute,
     private router: Router,
     public psn: PersonUtil,
     private cookies: CookieService,
     private socket: SocketService ) {}
  ngOnInit() {
   this.getPatients('queued');
   this.getClient();
   this.socket.io.on('record update', (update) => {
    const i = this.patients.findIndex(p => p._id === update.patient._id);
    switch (update.action) {
      case 'payment':
        console.log(update);
        if (i !== -1 ) {
          this.patients[i] =  { ...update.patient, card: this.patients[i].card };
        } else if (update.cart.some(prod => (prod.type === 'Cards' || prod.item.category === 'Consultation')
         && update.patient.record.visits[0][0].dept === this.cookies.get('dpt')) ) {
          this.patients.unshift({ ...update.patient, card: {menu: false, view: 'front', btn: 'discharge', indicate: true} });
        }
        break;
      case 'new report':
        if (i !== -1 ) {
          this.patients[i] =  { ...update.patient, card: { ...this.patients[i].card, indicate: true }};
        }
        break;
      case 'disposition':
        if (i !== -1 ) {
          this.patients.splice(i, 1);
          this.message = ( this.patients.length) ? null : 'No Record So Far';
        }
        break;
      default:
          if (i !== -1 ) {
            this.patients[i] = { ...update.patient, card: this.patients[i].card };
          }
          break;
    }
  });

   this.socket.io.on('store update', (data) => {
    if (data.action === 'new') {
      this.products.concat(data.changes);
    } else if (data.action === 'update') {
        for (const product of data.changes) {
            this.products[this.products.findIndex(prod => prod._id === product._id)] = product;
          }
    } else {
        for (const product of data.changes) {
          this.products.splice(this.products.findIndex(prod => prod._id === product._id) , 1);
        }
    }
  });
   this.socket.io.on('new report', (patient: Person) => {
    const i = this.patients.findIndex(p => p._id === patient._id);
    if (i !== -1 && patient.record.visits[0][0].dept === this.cookies.get('dept')) {
        this.patients.splice(i, 1).unshift(patient);
      }
  });

  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isInfo() {
      return this.router.url.includes('information');
    }
  isWard() {
      return this.router.url.includes('ward');
    }
    isConsult() {
      return !this.router.url.includes('information') &&
      !this.router.url.includes('pharmacy') &&
      !this.router.url.includes('billing') &&
      !this.router.url.includes('ward') &&
      !this.router.url.includes('admin');
  }
   refresh() {
    this.message = null;
    this.getPatients('queued');
    this.getClient();
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
next() {
  this.count = this.count + 1;
}
prev() {
  this.count = this.count - 1;
}
getLgas() {
  return this.lgas[this.states.indexOf(this.patient.info.contact.me.state)];
}
  routeHas(path) {
    return this.router.url.includes(path);
  }
  clearError() {
    this.errorMsg = null;
  }
  toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
   public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
  togglePhotoMenu() {
    this.showPhotoMenu = !this.showPhotoMenu;
  }
  public handleImage(webcamImage: WebcamImage): void {
     this.webcamImage = webcamImage;
  }
   public triggerSnapshot(): void {
    this.trigger.next();
    this.toggleWebcam();
  }
  viewDetails(i) {
    this.curIndex = i;
    this.count = 0;
    this.patient = cloneDeep(this.patients[i]);
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
 getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
  });
  }

  clearPatient() {
    this.reg = true;
    this.patient = new Person();
  }


  getDp(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  fetchDept() {
      return this.client.departments
      .filter(dept => (dept.hasWard) && (dept.name !== this.patient.record.visits[0][0].dept));
  }
  setAppointment() {
    this.patients[this.curIndex].record.appointments.unshift(this.session.appointment);
    this.patients[this.curIndex].record.visits[0][0].status = 'ap';
    this.processing = true;
    this.dataService.updateRecord(this.patients[this.curIndex], this.session.newItems).subscribe(patient => {
      this.processing = false;
      this.successMsg = 'Appointment Set';
      setTimeout(() => {
        this.successMsg = null;
      }, 3000);
      setTimeout(() => {
        this.switchCards(this.curIndex , 'front');
      }, 5000);
      setTimeout(() => {
        this.patients.splice(this.curIndex , 1);
      }, 7000);
     }, (e) => {
       this.processing = false;
       this.errorMsg = 'Unable to set Appointment';
     });
  }
  showMenu(i: number) {
    this.hideMenu();
    this.patients[i].card = { ...this.patients[i].card, menu: true, indicate: false};
  }
  hideMenu() {
    this.patients.forEach(p => {
      p.card.menu =  false;
    });
  }

  switchToNewMedic() {
    this.medicView = !this.medicView;
  }
  getRefDept() {
    return this.client.departments.filter(dept => dept.hasWard && dept.name !== this.dept);
  }

  dispose(i: number, disposition: string, label) {
    this.patients[i].record.visits[0][0].status = disposition;
    this.patients[i].card.btn = label;
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
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() -
        new Date(n.info.personal.dob).getFullYear());
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
   toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
switchBtn(option: string) {
   this.in = option;
}

getPatients(type) {
  this.loading = (this.page === 0) ? true : false;
  this.dataService.getPatients(type, this.page).subscribe((patients: Person[]) => {
     if (patients.length) {
      patients.forEach(p => {
      p.card = {menu: false, view: 'front', btn: 'discharge', indicate: false};
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
    // if(this.page > 0) {
    //     this.getPatients('queued');
    // }
  }
   getBMI() {
     return  (this.session.vitals.weight.value / Math.pow(this.session.vitals.height.value, 2)).toFixed(2);
   }
  selectPatient(i: number) {
    this.curIndex = i;
    this.reg = false;
    this.session = new Session();
    this.clonedPatient = cloneDeep(this.patients[i]);
    this.patient = this.patients[i];
    this.url = this.getDp(this.patient.info.personal.avatar);
   }

   removeDp() {
     this.url = null;
   }

  clearFeedback() {
    this.feedback = null;
  }
  getPriceTotal() {
    // let total = 0;
    //  this.session.medications.forEach((medic) => {
    //    total = total +  medic.stockInfo.price;
    //  });
    //  return total;
  }







}
