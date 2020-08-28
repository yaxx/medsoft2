import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person, Info} from '../../models/person.model';
import {Client, Department} from '../../models/client.model';
import {states, lgas } from '../../data/states';
import {Suggestion, Stamp, Invoice, Card, StockInfo} from '../../models/inventory.model';
import { Record,  Session} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import {PersonUtil} from '../../util/person.util';
import {host, appName} from '../../util/url';
import {sorter, searchPatients} from '../../util/functions';
import { AuthService } from '../../services/auth.service';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  appName = appName;
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  temp: Person[] = [];
  pool: Person[] = [];
  reserved: Person[] = [];
  patient: Person = new Person();
  uploader: FileUploader = new FileUploader({url: uri});
  temPatients: Person[] = new Array<Person>();
  file: File = null;
  client: Client = new Client();
  products = [];
  session: Session = new Session();
  input = '';
  reg = true;
  logout = false;
  view = 'bed';
  invoices: Invoice[][] = new Array<Invoice[]>();
  id = null;
  medicView = false;
  cardTypes = [];
  sortBy = 'added';
  successMsg = null;
  errorMsg = null;
  lgas = lgas;
  states = states;
  sortMenu = false;
  nowSorting = 'Date';
  message = null;
  feedback = null;
  searchTerm = '';
  selections = [];
  bills: Invoice[] = [];
  invoice: Invoice = new Invoice();
  selected = null;
  billing = false;
  bedNum = null;
  processing = false;
  updating = false;
  loading = false;
  curIndex = 0;
  count = 0;
  page = 0;
  stamp: Stamp = new Stamp();
  url = '';
  dept = null;
  cardCount = null;
  attachments: any = [];
  myDepartment = null;
  cardView = {
    orders: true,
    editing: false,
    reversing: false
  };

  constructor(
    private dataService: DataService,
    private socket: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    public psn: PersonUtil,
    private authService: AuthService,
    private cookies: CookieService
  ) { }
  ngOnInit() {
    this.stamp = new Stamp(localStorage.getItem('i'), localStorage.getItem('h'));
    this.getClient();
    this.myDepartment = this.route.snapshot.params['dept'];
    this.getPatients('Admit');
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('id', this.patients[this.curIndex]._id);
     };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
      this.attachments.push(JSON.parse(response));
    };
    this.socket.io.on('record update', (update) => {
      const i = this.patients.findIndex(p => p._id === update.patient._id);
      switch (update.action) {
        case 'ward':
            if (i !== -1) {
              this.patients[i] = { ...update.patient, card: { ...this.patients[i].card, indicate: true } };
            }
            break;
        case 'status update':
            if (i !== -1 ) {
              this.patients[i] = { ...update.patient, card: { ...this.patients[i].card, indicate: true } };
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
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.products = res.inventory;
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
  });
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
   onScroll() {
    this.page = this.page + 1;
    if (this.reserved.length) {
      if (this.reserved.length >  12 ) {
        this.patients = [...this.patients, ...this.reserved.slice(0, 12)];
        this.reserved.splice(0,  12);
      } else {
        this.patients = [...this.patients, ...this.reserved];
        this.reserved = [];
      }
    }
  }
  sortPatients(order: string) {
    this.sortMenu = false;
    this.nowSorting = order;
    this.patients = sorter(this.patients, order);
  }
  getLgas() {
    return this.lgas[this.states.indexOf(this.patient.info.contact.me.state)];
  }
  addInvoice() {
    this.bills.unshift({
      ...this.invoice,
      paid: true,
      stamp:this.stamp
    });
    this.invoice = new Invoice();
  }
  removeBill(i) {
    this.bills.splice(i, 1);
  }
  composeInvoices() {
    // const invoices = cloneDeep([...this.session.invoices, ...this.session.medInvoices]);
    if (this.bills.length) {
    if (this.patient.record.invoices.length) {
      if (new Date(this.patient.record.invoices[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for (const b of this.bills) {
          this.patient.record.invoices[0].unshift(b);
        }
       } else {
          this.patient.record.invoices.unshift(this.bills);
       }
      } else {
        this.patient.record.invoices = [this.bills];
      }
    }
    console.log(this.patient.record.invoices);
  }
  addBills() {
    this.processing = true;
    this.composeInvoices();
    // this.dataService.updateRecord(this.patient).subscribe((p: Person) => {
    //   this.socket.io.emit('record update', {action: 'invoice update', patient: p});
    //   this.successMsg = 'Bills added succesfully';
    //   this.patients[this.curIndex].record = p.record;
    //   this.bills = [];
    //   this.processing = false;
    //   setTimeout(() => {
    //     this.successMsg = null;
    //     this.billing = false;
    //   }, 3000);
    // }, () => {
    //   this.processing = false;
    //   this.errorMsg = 'Unable to Update Medications';
    // });
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
 selectPatient(i: number) {
  this.viewOrders(i);
 }
 switchToEdit() {
  this.patient.record.medications.forEach(inner => {
    inner.forEach(medic => {
      if (medic.stamp.selected) {
         this.selections.push(medic);
      }
    });
  });
  this.switchViews('editing');
}
switchBilling() {
  this.billing = !this.billing;
}
medSelected() {
  return this.patient.record.medications.some(med => med.some(m => m.stamp.selected));
 }
switchViews(view) {
  switch (view) {
    case 'orders':
    this.cardView.orders = true;
    this.cardView.editing = false;
    this.selections = [];
    break;
    case 'editing':
    this.cardView.orders = false;
    this.cardView.editing = true;
    break;
    default:
    break;
  }
}
resetOrders() {
  this.processing = false;
  setTimeout(() => {
    this.successMsg = null;
  }, 3000);
  setTimeout(() => {
    this.switchViews('orders');
  }, 5000);
}
getStyle(medication) {
  return {
    textDecoration: medication.paused ? 'line-through' : 'none',
    color: medication.paused ? 'light-grey' : 'black'
  };
}
selectMedication(i: number, j: number) {
  this.patient.record.medications[i][j].stamp.selected =
  this.patient.record.medications[i][j].stamp.selected ? false : true;
 }
 changeMedStatus() {
 this.processing = true;
 this.patient.record.medications.forEach(group => {
    group.forEach(medic => {
      if (medic.stamp.selected) {
        medic.paused = (medic.paused) ? false : true;
        medic.pausedOn = new Date();
        medic.stamp.selected = false;
      }
    });
  });
 this.dataService.updateRecord(this.patient).subscribe((p: Person) => {
    this.socket.io.emit('record update', {action: 'status update', patient: p});
    this.successMsg = 'Medication Status Updated';
    this.patients[this.curIndex].record = p.record;
    this.resetOrders();
  }, () => {
    this.errorMsg = 'Unable to Update Medications';
  });
}
updatePrices(invoices: Invoice[], i: number) {
  if (invoices.length) {
    invoices.forEach(invoice => {
      const p = (invoice.name === 'Card') ?
      this.products.find(prod => prod.item.name === invoice.desc) :
      this.products.find(prod => prod.item.name === invoice.name);
      if (p && !invoice.paid) {
        invoice.price = p.stockInfo.price;
      }
    });
    this.invoices[i] = invoices;
  } else {
    // this.invoices.splice(i, 1);
  }
}

viewOrders(i: number) {
  this.curIndex = i;
  this.patients[i].card.indicate = false;
  this.switchViews('orders');
  this.invoices = cloneDeep(this.patients[i].record.invoices);
  // this.invoices.forEach((invoices , j) => {
  //   const items = [];
  //   invoices.forEach((invoice) => {
  //     if (invoice.processed) {
  //       items.push(invoice);
  //     }
  //     });
  //   this.updatePrices(items, j);
  // });
}
  getDp(avatar: string) {
    return `${host}/dp/${avatar}`;
  }
  linked() {
    return !this.router.url.includes('information');
  }

  logOut() {
    this.authService.logOut();
  }
  getMyDp() {
    return localStorage.getItem('dp');
  }
  getRefDept() {
    return this.client.departments.filter(dept => dept.hasWard && dept.name !== this.dept);
  }
  refresh() {
    this.message = null;
    this.getPatients('Admit');
  }
  next() {
    this.count = this.count + 1;
  }
  prev() {
    this.count = this.count - 1;
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
    .subscribe((res: any) => {
      if (res.patients.length) {
        res.patients.forEach(p => { 
        p.card = {
          menu: false,
          view: 'front',
          btn: 'discharge',
          indicate: false,
          more: false
        };
      });
        this.populate(res.patients);
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

  showMoreIcon(i) {
    this.patients[i].card.more = true;
  }
  hideMoreIcon(i) {
    this.patients[i].card.more = false;
  }
  clearError() {
    this.errorMsg = null;
  }
  dispose(i: number, disposition: string, label) {
    this.patients[i].record.visits[0][0].status = disposition;
    this.patients[i].card.btn = label;
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
 isInfo() {
    return this.router.url.includes('information');
  }
  getBackgrounds() {
    const url = this.getMyDp();
    return {
      backgroundImage: `url(${url})`,
    };
  }
  isConsult() {
    return !this.router.url.includes('information') &&
    !this.router.url.includes('pharmacy') &&
    !this.router.url.includes('billing') &&
    !this.router.url.includes('ward') &&
    !this.router.url.includes('admin');
  }

  switchCards(i: number, face: string) {
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
    this.patients[i].record.visits[0][0].dept = (
      this.patients[i].record.visits[0][0].status !== 'queued') ? this.dept : this.patients[i].record.visits[0][0].dept;
    this.patients[i].record.visits[0][0].dischargedOn = new Date();
    this.dataService.updateRecord(this.patients[i], this.session.newServices).subscribe((p: Person) => {
      this.processing = false;
      this.socket.io.emit('record update', {action: 'disposition', patient: this.patients[i]});
      this.successMsg = 'Success';
      setTimeout(() => {
        this.successMsg = null;
      }, 3000);
      setTimeout(() => {
        this.switchCards(i, 'front');
      }, 6000);
      setTimeout(() => {
        this.patients.splice(i, 1);
        this.message = ( this.patients.length) ? null : 'No Record So Far';
      }, 10000);
   }, (e) => {
     this.errorMsg = 'Something went wrong';
     this.processing = false;
   });
  }

  toggleSortMenu() {
    // this.sortMenu = !this.sortMenu;
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
  showLogOut() {
    this.logout = true;
  }
  hideLogOut() {
    this.logout = false;
  }


}
