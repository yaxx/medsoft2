import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/inventory.model';
import {Tests, Scannings, Surgeries} from '../../data/request';
import {Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import {SocketService} from '../../services/socket.service';
import * as cloneDeep from 'lodash/cloneDeep';
import {host, appName} from '../../util/url';
import Simplebar from 'simplebar';
import 'simplebar/dist/simplebar.css';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  appName = appName;
  product: Product = new Product();
  clonedInventory: Product[] = [];
  item: Item = new Item();
  stockInfo: StockInfo = new StockInfo();
  temItems: Item[] = [];
  items: Item[] = [];
  patients: Person[] = [];
  scanItems = [];
  surgeryItems = [];
  inventoryItems = [];
  newItems: Item[] = [];
  products: Product[] = [];
  services: Product[] = [];
  cloned: Product;
  desc = [];
  temProducts: Product[] = [];
  editables: Product[] = [];
  edited: Product[] = [];
  selections: number[] = [];
  tests = Tests;
  scans = Scannings;
  matches = [];
  medications = [];
  input = '';
  logout = false;
  loading = false;
  processing = false;
  message = null;
  page = 0;
  tableView = 'Products';
  feedback = null;
  categories = [];
  menuView = false;
  cat = 'Products';
  errLine = null;
  header = 2;
  cardType = 'Standard';
  curentItems = [];
  sortBy = 'added';
  searchTerm = '';
  count = 0;
  tableHeaders = [
    ['CARD', 'PRICE', 'CARD NUMBER', 'STATUS', 'DATE ADDED'],
    ['SERVICE', 'CATEGORY', 'PRICE', 'REQUEST', 'DATE ADDED'],
    ['PRODUCT', 'CATEGORY', 'PRICE', 'QUANTITY', 'SOLD', 'DATE ADDED', 'EXPIRY'],
    ['PATIENT', 'MEDICATIONS', 'LAB', 'OTHERS','TOTAL EXPENSES']
  ];

  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private socket: SocketService) {
   }

  ngOnInit() {
    this.getProducts();
    this.socket.io.on('payment', changes => {
      changes.item.forEach(product => {
        this.curentItems[this.curentItems.findIndex(pro => pro._id === product._id)] = product;
    });
    });
    this.socket.io.on('new card', changes => {
        this.curentItems[this.curentItems.findIndex(pro => pro._id === changes.item._id)] = changes.item;
    });
    // this.socket.io.on('enroled', changes => {
    //     this.curentItems[this.curentItems.findIndex(pro => pro._id === changes.item._id)] = changes.item;
    // });
    // this.socket.io.on('refund', refund => {
    //     this.products.forEach(prod => {
    //       if(prod._id === refund.product._id) {
    //           prod.stockInfo.inStock = prod.stockInfo.inStock + refund.purchased;
    //           prod.stockInfo.sold = prod.stockInfo.sold - refund.purchased;
    //         }
    //     });
    // });
  }

  switchToEdit() {
    // this.product = this.products.filter((p) => p.selected)[0];
    // this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
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
  getProducts() {
    this.loading = (this.page === 0) ? true : false;
    this.dataService.getProducts().subscribe((res: any) => {
      this.items = res.items;
      this.patients = res.patients.map(p => {
        p.record.invoices = p.record.invoices.map(i => {
          let summary = [0,0,0];
          i.forEach(i=> {
            if(i.desc === 'Medication') {
              summary[0] = summary[0] + i.price * i.quantity
            } else if (i.desc === 'Test') {
              summary[1] = summary[1] + i.price * i.quantity
            } else {
              summary[2] = summary[2] + i.price * i.quantity
            }
          })
          return summary
        })
        return p
      })
      console.log(this.patients)
      if (res.inventory.length) {
        this.clonedInventory = res.inventory;
        this.products = res.inventory.map(p => ({...p, selected: false}));
        this.curentItems  =  [...this.curentItems, ...this.products.filter(product => product.type === 'Products')];
        this.medications  =  this.curentItems.map(m => m.item.name);
        this.loading = false;
        this.message = null;
        ++this.page;
      } else {
        this.message = (this.page === 0) ? `No ${this.tableView} So Far` : null;
        this.loading = false;
      }
    }, (e) => {
      this.loading = false;
      this.curentItems = [];
      this.message = '...Network Error';
    });
  }
getTotalExpenses(expenses) {
  let total = 0;
  expenses.forEach(e => {
    total = total + e;
  })
  return total;
}
  loadMore() {
    if (this.page > 0) {
      this.getProducts();
  }
}
  refresh() {
    this.getProducts();
  }
  formCompleted() {
    return this.product.item.name;
    // this.product.stockInfo.price &&
    // this.product.stockInfo.quantity &&
    // this.product.stockInfo.expiry;
  }
  searchTests() {
    if (!this.product.item.name) {
      this.matches = [];
    } else {
        this.matches = this.tests.filter((name) => {
        const patern =  new RegExp('\^' + this.product.item.name , 'i');
        return patern.test(name);
      });
    }
  }
  selectTest(match) {
    this.product.item.name = match;
    this.matches = [];
  }
  sortProducts(name: string) {
    switch (name) {
      case 'name':
        this.curentItems.sort((m, n) => m.item.name.localeCompare(n.item.name));
        this.sortBy = 'name';
        break;
      case 'category':
        this.curentItems.sort((m, n) => m.item.name.localeCompare(n.item.category));
        this.sortBy = 'category';
        break;
      // case 'description':
      //   this.curentItems.sort((m, n) => m.item.name.localeCompare(n.item.description));
      //   this.sortBy = 'description';
      //   break;
      case 'price':
        this.curentItems.sort((m, n) => m.stockInfo.price - n.stockInfo.price );
        this.sortBy = 'price';
        break;
      case 'quantity':
        this.curentItems.sort((m, n) => m.stockInfo.quantity - n.stockInfo.quantity );
        this.sortBy = 'quantity';
        break;
      case 'instock':
        this.curentItems.sort((m, n) => m.stockInfo.inStock - n.stockInfo.inStock );
        this.sortBy = 'instock';
        break;
      case 'sold':
        this.curentItems.sort((m, n) => n.stockInfo.sold - m.stockInfo.sold );
        this.sortBy = 'sold';
        break;
      case 'added':
        this.curentItems.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        this.sortBy = 'added';
        break;
        default:
        break;
    }
  }
  addMoreCard() {
    // if (this.products.some(product => product.item.description === this.product.item.description) ||
    // this.temProducts.some(product => product.item.description === this.product.item.description)) {
    // this.errLine = 'Card already exist';
    // } else {
      const p = cloneDeep({...this.product, type: this.tableView});
      this.temProducts.unshift(p);
      this.product.item.description = null;
    // }
  }
  addMore() {
    if (this.products.some(product => product.item.name === this.product.item.name) ||
      this.temProducts.some(product => product.item.name === this.product.item.name)) {
      this.errLine = 'Product already exist';
      } else {
      this.temProducts.unshift({...this.product, type: this.tableView});
      this.product = new Product();
    }
  }
  addMoreService() {
     if (this.products.some(product => product.item.name === this.product.item.name) ||
     this.temProducts.some(product => product.item.name === this.product.item.name)) {
    this.errLine = 'Service already exist';
    } else {
      this.temProducts.unshift({
        ...this.product, type: this.tableView
      });
      this.product = new Product();
    }
  }
  serviceFormCompleted() {
    return this.product.stockInfo.price && this.product.item.name && this.product.item.category;
  }
  isValidCard() {
    return (this.product.item.description &&
      this.product.item.description.length === 6 &&
      this.product.item.name &&
      this.product.stockInfo.price
      )
  }
  clearFeedback() {
    this.feedback = null;
    this.errLine = null;
  }
  toggleView(view: string, i: number) {
    this.header = i;
    this.tableView = view;
    const p = this.clonedInventory;
    this.curentItems =  p.filter(product => product.type === view).map(p => ({...p, selected: false}));
    this.message = (this.curentItems.length) ? null : `No ${view} So Far`;
    this.temProducts = [];
    this.editables = [];
    this.edited = [];
    this.product = new Product();
    this.curentItems.forEach(product => {
      product.selected = false;
    });
  }
  toggleMenu() {
    this.menuView = !this.menuView;
  }
  removeProduct(i: number) {
    this.temProducts.splice(i, 1);
  }
  selectCategory(i: Item) {
    this.product.item.category = i.name;
    this.categories = [];
  }
  addSelection(i: Item) {
    this.product.item = i;
    this.temItems = [];
  }

  selectProduct(i) {
    this.curentItems[i].selected = !this.curentItems[i].selected ;
  }
  pickSelection() {
    this.editables = cloneDeep(this.curentItems.filter(p => p.selected));
    this.count = this.editables.length;
    this.product = this.editables.shift();
    // this.input = this.product.item.name;
    // this.item = this.product.item;
  }
  pickDeletables() {
    return this.curentItems.filter(p => p.selected);
  }
  updateStock() {
    const oldProduct = this.products.find(product => product._id === this.product._id);
    this.product.stockInfo.inStock = this.product.stockInfo.inStock + (this.product.stockInfo.quantity - oldProduct.stockInfo.quantity);
    return this.product;
   }
  next() {
      this.edited.unshift(this.product);
      this.product = new Product();
      if (this.editables.length) {
          this.product = this.editables.shift();
      }
  }
  prev() {
       this.editables.unshift(this.product);
        this.product = this.edited.shift();
  }
  selectionOccure() {
    return this.curentItems.some((product) => product.selected);
  }
  dropSelection(i) {
    this.temProducts = this.temProducts.splice(i, 1);
  }
  hideCategories() {
    this.categories = [];
    this.clearFeedback();
  }
  showItems(type: string) {
    this.categories = this.items.filter(item => item.type === type);
}
getDescriptions() {
  switch (this.product.item.category) {
    case 'Card':
      // this.inventoryItems = ['Standard', 'Premium', 'Exclusive'];
    break;
    case 'Surgery':
      // this.matches = this.searchSurgeries();
    break;
    case 'Scanning':
      // this.inventoryItems = this.searchScans;
    break;
    case 'Test':
      this.searchTests();
    break;
    default:
    break;
  }

}

hideList() {
  this.inventoryItems = [];
}
getItems() {
  const prods = this.products;
  this.curentItems = prods.filter(product => product.type === this.tableView);
  return this.curentItems;
}
selectDesc(name) {
  this.product.item.name = name;
  this.inventoryItems = [];
}
searchItems(i: string, type: string) {
    if (i === '') {
      this.temItems = [];
    } else {
        this.temItems = this.items.filter(it => it.type === type).filter((item) => {
        const patern =  new RegExp('\^' + i , 'i');
        return patern.test(item.name);
      });
  }
}
searchMedications() {
  if (!this.product.item.name) {
    this.matches = [];
  } else {
      this.matches = this.medications.filter((name) => {
      const patern =  new RegExp('\^' + this.product.item.name, 'i');
      console.log(this.matches);
      return patern.test(name);
    });
  }
}
selectMedication(match) {
  this.product.item.name = match;
  this.matches = [];
}
searchDesc() {
    if (this.product.item.name === '') {
      this.inventoryItems = [];
    } else {
        this.inventoryItems = this.inventoryItems.filter((item) => {
        const patern =  new RegExp('\^' + this.product.item.name  , 'i');
        return patern.test(this.product.item.name);
      });
  }
}
  addProducts() {
    this.errLine = null;
    this.processing = true;
    this.dataService.addProducts(this.temProducts, this.newItems)
    .subscribe((products: Product[]) => {
      this.processing = false;
      this.feedback = 'Product added successfully';
      this.curentItems = [...products, ...this.curentItems];
      this.clonedInventory = [...products, ...this.clonedInventory];
      this.socket.io.emit('store update', {action: 'new', changes: products});
      this.temProducts = [];
      setTimeout(() => {
        this.feedback = null;
  }, 4000);
   }, (e) => {
        this.errLine = 'Could not add products';
        this.processing = false;
  });

  }
  clearTemVariables() {
    this.editables = this.edited = [];
    this.product = new Product();
    this.errLine = null;
  }
  updateProducts() {
    this.processing = true;
    this.dataService.updateProducts(this.edited).subscribe(() => {
        this.edited.forEach(product => {
          const i  = this.curentItems.findIndex(pro => pro._id === product._id);
          this.curentItems[i] = {...product, selected: false};
    });
    this.socket.io.emit('store update', {action: 'update', changes: this.edited});
    this.product = new Product();
    this.edited = [];
    this.editables = [];
    this.processing = false;
    this.feedback = 'Update succesfull';
    setTimeout(() => {
      this.feedback = null;
    }, 3000);
   }, (e) => {
      this.processing = false;
      this.feedback = 'Unable to update inventory';
    });
}
deleteProducts() {
  this.processing = true;
  const selections = this.curentItems.filter(p => p.selected);
  this.dataService.deleteProducts(selections).subscribe(() => {
      this.processing = false;
      this.feedback = 'Inventory succesffully updated';
      this.socket.io.emit('store update', {action: 'delete', changes: selections});
      this.curentItems = this.curentItems.filter(product => !product.selected);
      this.selections.forEach(product => {
      // this.clonedInventory = this.clonedInventory.filter(item => item._id !== product._id)
      });
   }, (e) => {
      this.processing = false;
      this.feedback = 'Unable to update inventory';
    });
  }
expired(expiry) {
  return Date.now() >= new Date(expiry).valueOf();
}

searchProducts(search: string) {
  if (!search) {
    const i = this.clonedInventory;
    this.curentItems = i.filter(product => product.type === this.tableView);
  } else {
     this.curentItems = this.curentItems.filter((product) => {
     const patern =  new RegExp('\^' + search , 'i');
     return patern.test(product.item.name);
  });
}

}

getSatus(status: boolean) {
  return (status) ? 'AVAILABLE' : 'TAKEN' ;
}

}
