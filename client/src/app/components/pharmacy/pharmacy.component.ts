import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person} from '../../models/person.model';
import {CookieService} from 'ngx-cookie-service';
import {Product, Item, StockInfo,Invoice} from '../../models/inventory.model';
import {Priscription, Medication} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import {sorter, searchPatients} from '../../util/functions';
import {host, appName} from '../../util/url';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
  appName = appName;
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  reserved: Person[] = [];
  pool: Person[] = [];
  temp: Person[] = [];
  patient: Person = new Person();
  products: Product[] = [];
  clonedStore: Product[] = [];
  cart: Product[] = [];
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = [];
  item: Item = new Item();
  items: Item[] = [];
  temItems: Item[] = [];
  searchedProducts: Product[] = [];
  invoices: Invoice[][] = new Array<Invoice[]>();
  edited: Invoice[] = [];
  editables: Invoice[] = [];
  tempMedications: Medication[] = [];
  inlinePatients = [];
  inlineProducts = [];
  transMsg = null;
  errMsg = null;
  input = '';
  logout = false;
  searchTerm = '';
  cardView = {
    orders: true,
    editing: false,
    reversing: false
  };
  sortBy = 'added';
  sortMenu = false;

  page = 0;
  nowSorting = 'Date';
  view = 'default';
  count = 0;
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
    private socket: SocketService ) { }

  ngOnInit() {
    this.getPatients();
    this.getProducts();
    this.socket.io.on('record update', (update) => {
      const i = this.patients.findIndex(p => p._id === update.patient._id);
      switch (update.action) {
        case 'encounter':
          if (!this.router.url.includes('completed')) {
            if (i !== -1) {
              if (this.recordChanged(update.bills)) {
                this.patients[i] = { ...update.patient, card: { indicate: true } };
              } else {
                this.patients[i] = { ...update.patient, card: this.patients[i].card };
              }
            } else  {
              this.patients.unshift({ ...update.patient, card: { menu: false, view: 'front', indicate: true } });
            }
          } else if (i !== -1) {
            this.patients.splice(i, 1);
            this.message = ( this.patients.length) ? null : 'No Record So Far';
          }
          break;
        case 'payment':
          if (i !== -1 ) {
            this.patients[i] = (update.cart.some(prod => prod.type === 'Products')) ?
              { ...update.patient, card: { indicate: true } } : { ...update.patient, card: this.patients[i].card};
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
  refresh() {
    this.message = null;
    this.getPatients();
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

  recordChanged(bills: string[]) : boolean {
    return (bills.length && bills.some(bill => bill === 'Medication')) ? true : false;
  }
  getDosage(desc: string) {
    return desc.split('|')[1];
  }
  switchViews(view) {
    switch(view) {
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

  switchToEdit() {
    this.edited = this.getSelections();
    this.switchViews('editing');
  }
  getMaxQty(med) {
    return this.products.find(prod => prod.item.name === med.name).stockInfo.quantity;
  }
  getReversables(i: number, j: number) {
    // this.curIndex = i;
    this.edited.push(this.patient.record.invoices[i][j]);
    this.switchViews('reversing');
  }
 sortPatients(order: string) {
    this.sortMenu = false;
    this.nowSorting = order;
    this.patients = sorter(this.patients, order)
  }
  getBackgrounds() {
    const url = this.getMyDp();
    return {
      backgroundImage: `url(${url})`,
    };
  }
  selectItem(i: number, j: number) {
   this.invoices[i][j].meta.selected = !this.invoices[i][j].meta.selected;
  }
  medidcationsSelected(i: number) {
    return this.invoices.some(med => med.some(m => m.meta.selected));
  }
  getSelections() {
    const selections = [];
    this.invoices.forEach(group => {
       group.forEach(medic => {
         if (medic.meta.selected) {
          medic.meta.selected = !medic.meta.selected;
          selections.push(medic);
         }
       });
     });
    return selections;
  }
  somePaid(i) {
    // return this.invoices[i].some(invoice => invoice.paid);
   }
updatePrices() {
    this.invoices.forEach(invoices => {
      invoices.forEach(invoice => {
        const p = this.products.find(prod => prod.item.name === invoice.name);
        if (p && !invoice.paid) {
          invoice.price = p.stockInfo.price;
        }
      });
    });
}
  viewOrders(i: number) {
    this.curIndex = i;
    this.patients[i].card.indicate = false;
    this.switchViews('orders');
    const medications = [];
    this.invoices = cloneDeep(this.patients[i].record.invoices);
    this.invoices.forEach((i1) => {
      let items = [];
      items = i1.filter(m => m.desc === 'Medication');
      if (items.length) {
        console.log(items);
        medications.push(items);
      }
    });
    this.invoices = medications;
    this.updatePrices();
  }
  reset() {
    setTimeout(() => {
      this.transMsg = null;
      this.cart = [];
      this.clonedStore = [];
    }, 3000);
    setTimeout(() => {
      this.edited = [];
      this.editables = [];
      this.switchViews('orders');
    }, 6000);

  }
  closeModal() {
    if (this.patients[this.curIndex].record.invoices.every(invoices => invoices.every(i => i.paid))) {
      this.patients.splice(this.curIndex, 1);
    }
  }
   sendRecord() {
    this.processing = true;
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((patient: Person) => {
      this.transMsg = 'Invoice successfully updated';
      this.socket.io.emit('record update', {action: 'invoice update', patient: patient});
      this.reset();
    }, (e) => {
      this.errMsg = 'Unable to update invoice';
      this.processing = false;
    });
  }
   updateInvoices() {
      this.edited.forEach(invoice => {
        invoice.processed = true;
        this.patients[this.curIndex].record.invoices.forEach((m) =>  {
          m[m.findIndex(i => i._id === invoice._id)] = invoice;
        });
        this.products.forEach(prod => {
          if(prod.item.name === invoice.name) {
            prod.stockInfo.quantity = prod.stockInfo.quantity - invoice.quantity;
          }
        });
      });
      this.sendRecord();
   }
  getTransTotal(invoices: Invoice[]) {
    let total = 0;
    invoices.forEach((invoice) => {
      total = (invoice.paid) ? (total + invoice.quantity * invoice.price) : (total + 0);
    });
    return total;
  }
  getPriceTotal() {
    let total = 0;
    this.edited.forEach((invoice) => {
       total = total + invoice.quantity * invoice.price;
     });
    return total;
  }

    getDp(avatar: String) {
      return `${host}/api/dp/${avatar}`;
  }



  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory.filter(p => p.type === 'Products');
      this.items = res.items;
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





routeHas(path) {
  return this.router.url.includes(path);
}
getStyle(i: Invoice) {
  return {color: i.processed ? 'black' : 'lightgrey'};
}
getCostedStyle(i: Invoice) {
  return {borderColor: i.processed ? 'lightgreen' : ''};
}
updateMedications() {
  this.processing = true;
  this.dataService.updateMedication(this.invoices).subscribe((m) => {
   this.patients[this.curIndex].record.invoices = this.invoices;
   this.processing = false;
   this.switchViews('orders');
  }, (e) => {
    this.transMsg = 'Unable to process payment';
    this.processing = false;
  });
}

}
