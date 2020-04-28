import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person} from '../../models/person.model';
import {CookieService} from 'ngx-cookie-service';
import {Product, Item, Invoice, Card, Meta, StockInfo} from '../../models/inventory.model';
import {Priscription, Medication} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import sorter from '../../util/functions';
import { PrintDriver } from 'ng-thermal-print/lib/drivers/PrintDriver';
import { PrintService, UsbDriver, WebPrintDriver } from 'ng-thermal-print';
import { timeout } from 'q';
import { fromEvent } from 'rxjs';
import {host, appName} from '../../util/url';
@Component({
  selector: 'app-cashier',
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.css']
})
export class CashierComponent implements OnInit {
  appName = appName;
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  patient: Person = new Person();
  products: Product[] = [];
  clonedStore: Product[] = [];
  card = new Card();
  cart: Product[] = [];
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = [];
  item: Item = new Item();
  searchedProducts: Product[] = [];
  invoice: Invoice = new Invoice();
  invoices: Invoice[][] = new Array<Invoice[]>();
  edited: Invoice[] = [];
  editables: Invoice[] = [];
  inlinePatients = [];
  inlineProducts = [];
  pool: Person[] = [];
  reserved: Person[] = [];
  searchResults: Person[] = [];
  transMsg = null;
  successMsg = null;
  errorMsg = null;
  errMsg = null;
  input = '';
  searchTerm = '';
  cardView = {
    orders: true,
    editing: false,
    reversing: false
  };
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date';
  view = 'default';
  count = 0;
  page = 0;
  billing = false;
  cardCount = null;
  bills: Invoice[] = [];
  credit: Invoice = new Invoice();
  credIndex = {row: 0, col: 0};
  id = '';
  logout = false;
  selected = null;
  curIndex = 0;
  loading = false;
  processing = false;
  message = null;
  status = false;
  usbPrintDriver: UsbDriver;
  webPrintDriver: WebPrintDriver;
  ip = '';
  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private router: Router,
    private printService: PrintService,
    private socket: SocketService) { }

  ngOnInit() {
    this.getPatients('billing');
    this.getProducts();
    this.socket.io.on('record update', (update) => {
      const i = this.patients.findIndex(p => p._id === update.patient._id);
      switch (update.action) {
        case 'encounter':
          if (!this.router.url.includes('completed')) {
            if (i !== -1) {
              if (this.recordChanged(update.bills)) {
                this.patients[i] = { ...update.patient, card: { ...this.patients[i].card, indicate: true } };
              } else {
                this.patients[i] = { ...update.patient, card: this.patients[i].card };
              }
            } else {
              this.patients.unshift({ ...update.patient, card: { menu: false, view: 'front', indicate: true } });
            }
          } else if (i !== -1) {
            if (this.recordChanged(update.bills)) {
              this.patients.splice(i, 1);
              this.message = ( this.patients.length) ? null : 'No Record So Far';
            }
          }
          break;
        case 'invoice update':
              if (!this.router.url.includes('completed')) {
                if (i !== -1) {
                  this.patients[i] = { ...update.patient, card: { ...this.patients[i].card, indicate: true } };
                } else {
                  this.patients.unshift({ ...update.patient, card: { menu: false, view: 'front', indicate: true } });
                }
              }
              break;
        case 'payment':
          if (i !== -1 ) {
            this.patients[i] = { ...update.patient, card: this.patients[i].card };
          }
          break;
        case 'enroled':
          if (!this.router.url.includes('completed')) {
            if (i !== -1 ) {
              this.patients[i] = { ...update.patient, card: { ...this.patients[i].card, indicate: true } };
            } else {
              this.patients.unshift({ ...update.patient, card: { menu: false, view: 'front', indicate: true } });
            }
          } else if (i !== -1 ) {
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
        this.products = [...data.changes, ...this.products];
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
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  recordChanged(bills: string[]) : boolean {
    return (bills.length && bills.some(bill => bill === 'cashier')) ? true : false;
  }
  refresh() {
    this.message = null;
    this.getPatients('billing');
    this.getProducts();
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
  selectResult(person) {
    const i = this.patients.findIndex(p => p._id === person._id);
    if (i !== -1) {
      this.patients.splice(i, 1);
    } else {}
    this.patients.unshift(person);
    this.pool = this.clonedPatients;
    this.searchResults = [];
    this.searchTerm  = null;
  }
  getDesc(desc: string) {
    return desc.split('|')[0];
  }
  generatePin(): string {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000).toString();
  }
 switchToEdit() {
  this.invoices.forEach(inner => {
    inner.forEach(invoice => {
      if (invoice.meta.selected) {
       invoice.meta.selected = !invoice.meta.selected;
       this.edited.push(invoice);
      }
    });
  });
  this.billing = false;
  this.switchViews('editing');
}
switchCardView(i , view) {
  this.curIndex = i;
  this.cardCount = view;
  this.patients[i].card.view = view;
  this.patient = cloneDeep(this.patients[i]);
  this.card.pin = this.generatePin();
  // this.card = this.patient.record.cards[0] || new Card();
}
updateInvoices() {
    this.edited.forEach(invoice => {
      if(invoice.name !=='Credit') {
        this.patients[this.curIndex].record.invoices.forEach((m) => {
          m[m.findIndex(i => i._id === invoice._id)] = {
            ...invoice,
            paid: true,
            datePaid: new Date(),
            comfirmedBy: this.cookies.get('i')
          };
        });
        this.products.forEach(prod => {
          if (prod.item.name === invoice.name || prod.item.name === invoice.desc) {
            if (invoice.name === 'Card' || invoice.name === 'Consultation') {
            } else {
              prod.stockInfo.quantity = prod.stockInfo.quantity - invoice.quantity;
              prod.stockInfo.sold = prod.stockInfo.sold + invoice.quantity;
            }
            this.cart.push(prod);
          }
        });
      }

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
  this.credit = new Invoice()
  this.curIndex = i;
  this.patients[i].card.indicate = false;
  this.switchViews('orders');
  this.patient = cloneDeep(this.patients[i]);
  this.invoices = cloneDeep(this.patients[i].record.invoices);
  this.invoices.forEach((invoices , row) => {
    const items = [];
    invoices.forEach((invoice, col) => {
      if (invoice.processed) {
        items.push(invoice);
      } else {}
      if (invoice.name === 'Credit') {
        this.credit = invoice;
        this.invoices.splice(row, 1);
        this.invoices.unshift([this.credit]);
      }
      });
    this.updatePrices(items, row);
  });
}
runTransaction(type: string, patient) {
  this.errorMsg = null;
  this.processing = true;
  this.dataService.runTransaction(patient._id, patient.record, this.cart, this.edited).subscribe((p: any) => {
    this.products = this.clonedStore;
    this.processing = false;
    this.patients[this.curIndex].record = p.record;
    this.invoices = p.record.invoices;
    this.socket.io.emit('record update', {action: 'payment', patient: p, cart: this.cart});
    this.successMsg = (type === 'purchase') ? 'Payment successfully comfirmed' : 'Transaction successfully reversed';
    this.resetOrders();
  }, (e) => {
    this.errorMsg = (type === 'purchase') ?  'Something went wrong' : 'Unable to reverse transaction';
    this.processing = false;
  });
}
processCredit() {
  if (this.credit.price) {
    if (this.invoices[0][0].name === 'Credit') {
      this.invoices[0][0]  = this.credit;
    } else {
      this.invoices.unshift([{
        ...this.credit,
        name: 'Credit',
        desc: 'To pay later',
        kind: 'Credit',
        meta: new Meta(this.cookies.get('i'), this.cookies.get('h'))
      }
    ]);
    }

  } else if (this.invoices[0][0].name === 'Credit') {
    this.invoices.splice(0, 1);
  }
}
comfirmPayment() {
  this.processCredit();
  if ( this.edited.some(i => i.name === 'Card' || i.name === 'Consultation')) {
    this.patients[this.curIndex].record.visits[0][0].status = 'queued';
  } else {}
  this.patients[this.curIndex].record.invoices = this.invoices;
  this.updateInvoices();
  this.runTransaction('purchase', this.patients[this.curIndex]);
 }

switchViews(view) {
  switch (view) {
    case 'orders':
    this.cardView.orders = true;
    this.cardView.editing = false;
    this.cardView.reversing = false;
    this.edited = this.editables = [];
    break;
    case 'editing':
    this.cardView.orders = false;
    this.cardView.editing = true;
    this.cardView.reversing = false;
    break;
    case 'reversing':
    this.cardView.orders = false;
    this.cardView.editing = false;
    this.cardView.reversing = true;
    break;
    default:
    break;
  }
}

  assignCard() {
  const i = this.products.findIndex(p => p.item.description === this.card.pin);
  if (i !== -1) {
    if (this.products[i].stockInfo.status) {
        this.products[i].stockInfo.status = false;
        this.patient.record.invoices[0][0] = {
        ...this.patient.record.invoices[0][0],
        paid: true,
        price: this.products[i].stockInfo.price,
        datePaid: new Date(),
        comfirmedBy: this.cookies.get('i')
    };
        this.cart.push(this.products[i]);
        this.patient.record.visits[0][0].status = 'queued';
        this.runTransaction('purchase', this.patient);
    } else {
      this.errorMsg = 'Card Unavailable';
    }

  } else {
    this.errorMsg = 'Card Unavailable';
  }

}

  getReversables(i: number, j: number) {
    // this.curIndex = i;
    // this.edited.push(this.patient.record.medications[i][j]);
    // this.switchViews('reversing');
  }
  sortPatients(order: string) {
    this.sortMenu = false;
    this.nowSorting = order;
    this.patients = sorter(this.patients, order)
  }

  selectItem(i: number, j: number) {
   this.invoices[i][j].meta.selected = !this.invoices[i][j].meta.selected;
  }
  selectCard(i) {
    this.patient.record.cards[i].meta.selected =  !this.patient.record.cards[i].meta.selected;
  }
  invoiceSelcted() {
    return this.invoices.some(invoices => invoices.some(i => i.meta.selected));
  }

  resetOrders() {
    setTimeout(() => {
      this.successMsg = null;
      this.cart = [];
      this.clonedStore = [];
    }, 3000);
    setTimeout(() => {
      this.switchViews('orders');
      this.switchCardView(this.curIndex, 'front');
    }, 4000);
  }
  reset() {
    setTimeout(() => {
      this.transMsg = null;
      this.cart = [];
      this.clonedStore = [];
    }, 3000);
    setTimeout(() => {
      this.switchViews('orders');
    }, 6000);
  }




  somePaid(i) {
    // return this.medications[i].some(m => m.invoice.paid);
   }
   getTransTotal(i) {
    // let total = 0;
    // this.patient.record.medications[i].forEach((m) => {
    //   total = (m.invoice.paid) ? (total + m.invoice.quantity * m.invoice.price) : (total + 0);
    // });
    // return total;
  }
  getPriceTotal() {
    let total = 0;
    this.edited.forEach((invoice) => {
       total = total + invoice.quantity * invoice.price;
     });
    return total.toFixed(2);
  }
    getDp(avatar: string) {
      return `${host}/api/dp/${avatar}`;
  }
  getStyle(i) {
    return {color: i.paid ? 'black' : 'lightgrey'};
  }
  markAsCreadit(i: number, optn: boolean) {
    this.edited[i].credit = optn;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory;
    });
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
  searchPatient(name: string) {
    if (name) {
      this.searchResults = this.pool.filter((patient) => {
       const patern =  new RegExp('\^' + name  , 'i');
       return patern.test(patient.info.personal.firstName);
       });
    } else {
       this.searchResults = [];
       this.pool = this.clonedPatients;
    }
   }
   composeInvoices() {
    // const invoices = cloneDeep([...this.session.invoices, ...this.session.medInvoices]);
    if (this.bills.length) {
    if (this.patient.record.invoices.length) {
      if (new Date(this.patient.record.invoices[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
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
  }
  addInvoice() {
    this.bills.unshift({
      ...this.invoice,
      meta: new Meta(this.cookies.get('i'), this.cookies.get('h'))
    });
    this.invoice = new Invoice();
  }
  matchBills() {
    if (this.invoices.length) {
      if (new Date(this.invoices[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const b of this.bills) {
          this.invoices[0].unshift(b);
        }
       } else {
          this.invoices.unshift(this.bills);
       }
      } else {
        this.invoices = [this.bills];
      }
  }
   addBills() {
    this.processing = true;
    this.composeInvoices();
    this.dataService.updateRecord(this.patient).subscribe((p: Person) => {
      this.socket.io.emit('record update', {action: 'invoice update', patient: p});
      this.successMsg = 'Bills added succesfully';
      this.patients[this.curIndex].record = p.record;
      this.matchBills();
      this.bills = [];
      this.processing = false;
      setTimeout(() => {
        this.successMsg = null;
        this.billing = false;
      }, 3000);
    }, () => {
      this.processing = false;
      this.errorMsg = 'Unable to Update Medications';
    });
  }
  switchBilling() {
    this.billing = !this.billing;
  }
  removeBill(i) {
    this.bills.splice(i, 1);
  }
  }

