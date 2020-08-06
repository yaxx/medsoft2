import {CookieService } from 'ngx-cookie-service';
export class Stamp {
  constructor(
    public addedBy: any = null,
    public facility: any = null,
    public selected: boolean = false,
    public dateAdded: Date = new Date()
  ) {}
}
export class Suggestion {
  constructor(
    public name: string = null,
    public category: string = null,
    public stamp: Stamp = new Stamp(),
    public _id?: string
    ) {}
}
export class StockInfo {
  constructor(
    public quantity: number = 0,
    public price: number = 1,
    public sold: number = 0,
    public category: string = 'Medication',
    public expiry: Date = null
  ) {}
}
export class StockItem {
  constructor(
    public category: string = null,
    public name: string = null,
    public size: number = 1,
    public form: string = null,
    public unit: string = null
    ) {}
}
export class Service {
  constructor(
    public name: string = null,
    public stockInfo: StockInfo = new StockInfo(),
    public stamp: Stamp = new Stamp()
  ) {}
}
export class Stock {
  constructor(
    public category: string = null,
    public stockItem: StockItem = new StockItem(),
    public stockInfo: StockInfo = new StockInfo(),
    public stamp: Stamp = new Stamp(),
    public signature: string = null,
    public _id?: string
  ) {}
}
export class Invoice {
  constructor(
    public name: string = null,
    public desc: string = null,
    public kind: string = null,
    public price: number = null,
    public paid: boolean = false,
    public credit: boolean = false,
    public quantity: number = 1,
    public datePaid: string = null,
    public processed: boolean = true,
    public comfirmedBy: Stamp = new Stamp(),
    public stamp: Stamp = new Stamp(),
    public _id?: string
  ) {}
}

export class Card {
  constructor(
    public category: string = 'Standard',
    public pin: string = null,
    public stamp: Stamp = new Stamp()
    ) {}
  }
export class Inventory {
  constructor(
    public stocks: Stock[] = []
    ) {}
  }

