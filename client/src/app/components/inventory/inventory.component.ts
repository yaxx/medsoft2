import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Inventory, Suggestion, Service, Stock, StockInfo} from '../../models/inventory.model';
import {Tests, Scannings, Surgeries} from '../../data/request';
import {Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import {SocketService} from '../../services/socket.service';
import * as cloneDeep from 'lodash/cloneDeep';
import {host, appName} from '../../util/url';
import Simplebar from 'simplebar';
import {sortInventory} from '../../util/functions';
import 'simplebar/dist/simplebar.css';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  appName = appName;
  stock: Stock = new Stock();
  clonedStocks: Stock[] = [];
  stockInfo: StockInfo = new StockInfo();
  suggestions: Suggestion[] = [];
  tempSuggestions: Suggestion[] = [];
  patients: Person[] = [];
  scanItems = [];
  actionMode = null;
  surgeryItems = [];
  inventoryItems = [];
  newSuggestions: Suggestion[] = [];
  suggestion: Suggestion = new Suggestion();
  cloned: Stock;
  desc = [];
  stockNames = [];
  temStocks: Stock[] = [];
  stocksInView: Stock[] = [];
  editables: Stock[] = [];
  edited: Stock[] = [];
  selections: number[] = [];
  tests = Tests;
  scans = Scannings;
  matches = [];
  stocks = [];
  input = '';
  logout = false;
  loading = false;
  processing = false;
  message = null;
  page = 0;
  fieldMissing = false;
  tableView = 'Transactions';
  feedback = null;
  categories = [];
  menuView = false;
  expSummary = [];
  stocksForm = [1, 1, 1, 1, 1, 1];
  cat = 'Stocks';
  errLine = null;
  header = 2;
  cardType = 'Standard';
  inventory: Inventory = new Inventory();
  sortBy = 'added';
  err = false;
  searchTerm = '';
  count = 0;
  clonedPatients = [];
  curDate = new Date();

  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private socket: SocketService) {
   }

  ngOnInit() {
    this.getStocks();
    this.socket.io.on('record update', changes => {
     if (changes.action === 'payment') {
       changes.patient.record.invoices = this.summarizeInvoice(changes.patient.record.invoices);
       const i = this.patients.findIndex(p => p._id === changes.patient._id);
       if (i !== -1) {
          this.patients.splice(i, 1);
          this.patients.unshift(changes.patient);
        } else {
          this.patients.unshift(changes.patient);
        }
     }
    });
    this.socket.io.on('new card', changes => {
        // this.stocks[this.stocks
        //   .findIndex(pro => pro._id === changes.item._id)] = changes.item;
    });
  }
  getTransactions() {
    this.patients = [];
    this.expSummary = [];
    this.loading = true;
    this.dataService
    .getTransactions(new Date(this.curDate))
    .subscribe((patients: any) => {
      this.sumTransactions(patients);
    }, (e) => {
      this.loading = false;
      this.message = '...Network Error';
    });
  }
  setActionMode(action) {
    this.actionMode = action;
  }
  switchToEdit() {
  }
  getDp(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
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
  getStocks() {
    this.loading =  true;
    this.patients = [];
    this.dataService.getStocks().subscribe((res: any) => {
      this.loading = false;
      this.sumTransactions(res.patients);
      this.suggestions = res.suggestions;
      this.distInventory(res.inventory);
    }, (e) => {
      this.loading = false;
      this.patients = [];
      this.message = '...Network Error';
    });
  }
  distInventory(inventory) {
    this.stocks = inventory;
    this.clonedStocks = cloneDeep(inventory);
      this.stockNames  =  this.stocks.map(st => st.stockItem.name);
  }
  summarizeInvoice(invoices) {
    const summary = [0, 0, 0];
    invoices.map(invoice => {
      invoice.forEach(i => {
        if (i.desc === 'Medication') {
          summary[0] = summary[0] + i.price * i.quantity;
        } else if (i.desc === 'Test') {
          summary[1] = summary[1] + i.price * i.quantity;
        } else {
          summary[2] = summary[2] + i.price * i.quantity;
        }
      });
    });
    this.expSummary.push(summary);
    return summary;
  }
  sumTransactions(patients) {
    if (patients.length) {
      this.patients = patients.map(p => {
        p.record.invoices =  this.summarizeInvoice(p.record.invoices);
        return p;
      });
    } else {
      this.loading = false;
      this.message = 'NO TRANSACTIONS SO FAR';
    }

  }
  getSubTotals() {
    const sums = [0, 0, 0];
    this.expSummary.forEach(exp => {
      sums[0] = sums[0] + exp[0];
      sums[1] = sums[1] + exp[1];
      sums[2] = sums[2] + exp[2];
    });
    return sums;
  }
  getOveralTotal() {
    return this.getSubTotals().reduce((n, m) => n + m, 0);
  }

  getTotalExpenses(expenses) {
    return expenses.reduce((n, m) => n + m, 0);
  }
  loadMore() {
    if (this.page > 0) {
      this.getStocks();
    }
  }
  refresh() {
    this.getStocks();
  }

  searchTests() {
    if (!this.stock.stockItem.name) {
      this.matches = [];
    } else {
        this.matches = this.tests.filter((name) => {
        const patern =  new RegExp('\^' + this.stock.stockItem.name , 'i');
        return patern.test(name);
      });
    }
  }
  selectTest(match) {
    this.stock.stockItem.name = match;
    this.matches = [];
  }
  sortInventory(name: string) {
    this.inventory = sortInventory(this.inventory, this.tableView, name);
    this.sortBy = name;
  }
  formCompleted() {

  }
  addMoreCard() {
      // const p = cloneDeep({...this.stockItem, type: this.tableView});
      // this.temStocks.unshift(p);
      // this.stock.stockItem.description = null;
    // }
  }
  missingField() {
    return this.stocksForm.every(s => s === 1);
  }
  clearFeedback(i) {
    this.stocksForm[i] = 1;
  }
  isValidStock() {
    this.stocksForm[0] = (this.stock.stockItem.name) ? 1 : 0;
    this.stocksForm[1] = (this.stock.stockInfo.category) ? 1 : 0;
    this.stocksForm[2] = (this.stock.stockItem.size) ? 1 : 0;
    this.stocksForm[3] = (this.stock.stockItem.unit) ? 1 : 0;
    this.stocksForm[4] = (this.stock.stockInfo.price) ? 1 : 0;
    this.stocksForm[5] = (this.stock.stockInfo.quantity) ? 1 : 0;
    return this.missingField();
  }
  addMoreStock() {
    // if (this.isValidStock()) {
      if (this.inventory.stocks.every(
      stock => stock.stockItem !== this.stock.stockItem)) {
        this.temStocks.unshift({
          ...this.stock,
          stamp: {...this.stock.stamp, selected: false},
          category: this.tableView
        });
        if (this.tempSuggestions.some(s => s.name !== this.stock.stockItem.name)) {
        this.tempSuggestions.unshift({
        ...this.suggestion,
        category: this.tableView
        });
      }
        this.fieldMissing = false;
        this.errLine = 'Please fill in all required fields';
        this.stock = new Stock();
    } else {
      this.errLine = 'Stock already added';
    }
  // } else {
  //   this.fieldMissing = true;
  //   this.errLine = 'Please fill in all required fields';
  // }
}

  serviceFormCompleted() {
    return this.stock.stockInfo.price && this.stock.stockItem.name && this.stock.stockInfo.category;
  }

  toggleView(view: string) {
    this.tableView = view;
    this.stocksInView = [];
    this.stocks.forEach(stock => {
      if (stock.category ===  view) {
        this.stocksInView.push(stock);
      }
    });
    this.message = (!this.stocksInView.length) ? `No ${view} So Far` : '';
    this.edited = [];
    this.stock = new Stock();
  }
  toggleMenu() {
    this.menuView = !this.menuView;
  }
  removeStock(i: number) {
    this.temStocks.splice(i, 1);
  }
  selectCategory(i: string) {
    // this.stock.stockItem.category = i.name;
    // this.categories = [];
  }
  addSelection(i: string) {
    // this.stockItem.item = i;
    // this.temItems = [];
  }
  getBackgrounds() {
    const url = this.getMyDp();
    return {
      backgroundImage: `url(${url})`,
    };
  }
  isInfo() {
    // return this.router.url.includes('information');
  }
  selectStock(i) {
    this.stocksInView[i].stamp.selected = !this.stocksInView[i].stamp.selected ;
  }
  pickSelection() {
    this.temStocks = cloneDeep(this.stocksInView.filter(s => s.stamp.selected));
    this.setActionMode('edit');
    this.count = this.temStocks.length;
    this.stock = this.temStocks.shift();
  }
  pickDeletables() {
    return this.stocksInView.filter(stock => stock.stamp.selected);
  }

  next() {
      this.edited.unshift(this.stock);
      this.stock = new Stock();
      if (this.temStocks.length) {
          this.stock = this.temStocks.shift();
      }
  }
  prev() {
      this.temStocks.unshift(this.stock);
      this.stock = this.edited.shift();
  }
  stockSelcted() {
    return  this.stocksInView.some(stock => stock.stamp.selected);
  }
  dropSelection(i) {
    this.temStocks = this.temStocks.splice(i, 1);
  }
  hideCategories() {
    // this.categories = [];
    // this.clearFeedback();
  }
  showItems(type: string) {
    // this.categories = this.items.filter(item => item.type === type);
  }
getDescriptions() {
  // switch (this.stock.stockItem.category) {
  //   case 'Card':
  //     this.inventoryItems = ['Standard', 'Premium', 'Exclusive'];
  //   break;
  //   case 'Surgery':
  //     this.matches = this.searchSurgeries();
  //   break;
  //   case 'Scanning':
  //     this.inventoryItems = this.searchScans;
  //   break;
  //   case 'Test':
  //     this.searchTests();
  //   tslint:disable-next-line:align
  //   break;
  //   default:
  //   break;
  // }

}

hideList() {
  this.inventoryItems = [];
}
getItems() {
//   const prods = this.stockItems;
//   this.stocks = prods.filter(product => stockItem.type === this.tableView);
//   return this.stocks;
}
selectDesc(name) {
  this.stock.stockItem.name = name;
  this.inventoryItems = [];
}
searchItems(i: string, type: string) {
  //   if (i === '') {
  //     this.temItems = [];
  //   } else {
  //       this.temItems = this.items.filter(it => it.type === type).filter((item) => {
  //       const patern =  new RegExp('\^' + i , 'i');
  //       return patern.test(item.name);
  //     });
  // }
}
searchSuggestion() {
  if (!this.stock.stockItem.name) {
    this.matches = [];
  } else {
      this.matches = this.stockNames.filter((name) => {
      const patern =  new RegExp('\^' + this.stock.stockItem.name, 'i');
      return patern.test(name);
    });
  }
}
selectSuggestion(suggetion) {
  this.stock.stockItem.name = suggetion;
  this.matches = [];
}
searchDesc() {
    if (this.stock.stockItem.name === '') {
      this.inventoryItems = [];
    } else {
        this.inventoryItems = this.inventoryItems.filter((item) => {
        const patern =  new RegExp('\^' + this.stock.stockItem.name  , 'i');
        return patern.test(this.stock.stockItem.name);
      });
  }
}
updateLocalStocks(newStocks) {
  switch (this.actionMode) {
    case 'add':
      this.stocksInView = [...newStocks, ...this.stocksInView];
      this.clonedStocks = [...newStocks, ...this.clonedStocks]
      this.feedback = 'Stocks added successfully';
      break;
    case 'edit':
      this.edited.forEach( s => {
        this.stocksInView = this.stocksInView
        .map(stock => (s._id === stock._id) ? s : stock);
        this.clonedStocks = this.clonedStocks
        .map(stock => (s._id === stock._id) ? s : stock);
      });
      this.edited = [];
      this.feedback = 'Stocks edited successfully';
      break;
    case 'delete':
      this.stocksInView = this.stocksInView.filter(stock => !stock.stamp.selected);
      this.clonedStocks = this.clonedStocks.filter(stock => !stock.stamp.selected);
      this.feedback = 'Stocks deleted successfully';
      break;
    default:
      break;
  }
  this.temStocks = [];
}
updateStocks() {
    this.feedback = null;
    this.err = false;
    this.processing = true;
    this.dataService.updateStocks((this.actionMode === 'add'||this.actionMode === 'delete') ? this.temStocks : this.edited, this.actionMode, this.newSuggestions)
    .subscribe((newStocks) => {
      this.processing = false;
      this.updateLocalStocks(newStocks);
      this.socket.io.emit('store update', {action: this.actionMode, changes: this.temStocks});
      this.temStocks = [];
      setTimeout(() => {
        this.feedback = null;
  }, 4000);
   }, (e) => {
        this.feedback = 'Could not add products';
        this.processing = false;
        this.err = true;
  });

  }
  clearTemVariables() {
    this.editables = this.edited = [];
    this.stock = new Stock();
    this.errLine = null;
    this.temStocks = [];
  }


expired(exp: string) {
  return false;
  // return Date.now() >= new Date(exp).valueOf();
}

searchInventory(search: string) {
    if (!search) {
      this.stocksInView = this.clonedStocks.filter(stock => stock.category === this.tableView);
    } else {
       this.stocksInView = this.stocksInView.filter((stock) => {
       const patern =  new RegExp('\^' + search , 'i');
       return patern.test(stock.stockItem.name);
    });
  }
}


searchPatient(name: string) {
  // if (name) {
  //   this.clonedPatients = cloneDeep(this.patients);
  //   this.patients = this.patients.filter((patient) => {
  //    const patern =  new RegExp('\^' + name  , 'i');
  //    return patern.test(patient.info.personal.firstName);
  //    });
  // } else {
  //    this.patients = this.clonedPatients;
  // }
 }

getSatus(status: boolean) {
  // return (status) ? 'AVAILABLE' : 'TAKEN' ;
}

}
