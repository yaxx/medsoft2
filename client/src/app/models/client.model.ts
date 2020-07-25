import {Inventory} from './inventory.model';
import {Person} from './person.model';

export class Bed {
  constructor(
    public bedNumber: number  = null,
    public allocated: boolean = false,
    public dateCreated: Date = new Date() ) {}
}
export class Room {
  constructor(
    public _id?: string,
    public name: string = null,
    public roomNumber: number = null,
    public beds: Bed[] = [],
    public dateCreated: Date = new Date() ) {}
}

export class Department {
  constructor(
    public name: string = null,
    public category: string = null,
    public hasWard: boolean = false,
    public numbOfRooms: number = 0,
    public numbOfBeds: number = 0,
    public menu?: boolean
    ) {}
}
export class Info {
  constructor(
    public name: string = null,
    public mobile: string = null,
    public email: string = null,
    public state: string = null,
    public city: string= null,
    public zipcode: string = null,
    public expiry: Date = null,
    public ownership: string = null,
    public specialization: string = null,
    public category: string = null,
    public password: string = null,
    public comfirm: string = null,
    public address: string = null
   ) {}
}

export class Client {
  constructor(
    public _id?: string,
    public info: Info = new Info(),
    public departments: Department[] = [],
    public staffs: Person[] = [],
    public inventory: Inventory = new Inventory()
    ) {}
}
