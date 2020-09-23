  import {Person} from '../models/person.model';
  import {Inventory, Stamp} from '../models/inventory.model';
  const stampItem = () => new Stamp(localStorage.getItem('i'), localStorage.getItem('h'));
  export const sorter  = (patients: Person[], order: string) =>  {
    switch (order) {
      case 'A-Z':
        return patients.sort((m: Person, n: Person) =>
         m.info.personal.firstName.localeCompare(n.info.personal.firstName));
        break;
      case 'Gender':
        return patients.sort((m: Person, n: Person) =>
         n.info.personal.gender.localeCompare(m.info.personal.gender));
        break;
        case 'Age':
        return patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() -
        new Date(n.info.personal.dob).getFullYear());
        break;
      case 'Date':
        return patients.sort((m, n) =>
         new Date(n.createdAt).getTime() - new Date(m.updatedAt).getTime());
        break;
        default:
        break;
    }
  }
  export const sortInventory  = (inventory: Inventory, category: string, order: string) =>  {
    if (category === 'stocks') {
      switch (order) {
      case 'name':
        this.inventory.stocks.sort((m, n) => m.product.name.localeCompare(n.product.name));
        break;
      case 'category':
        this.inventory.stocks.sort((m, n) => m.product.name.localeCompare(n.product.category));
        break;
      case 'price':
        this.inventory.stocks.sort((m, n) => m.stockInfo.price - n.stockInfo.price );
        break;
      case 'quantity':
        this.inventory.stocks.sort((m, n) => m.stockInfo.quantity - n.stockInfo.quantity );
        break;
      case 'instock':
        this.inventory.stocks.sort((m, n) => m.stockInfo.inStock - n.stockInfo.inStock );
        break;
      case 'sold':
        this.inventory.stocks.sort((m, n) => n.stockInfo.sold - m.stockInfo.sold );
        break;
      case 'added':
        this.inventory.stocks.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        break;
        default:
        break;
    }
  } else {
    switch (order) {
      case 'name':
        this.inventory.services.sort((m, n) => m.name.localeCompare(n.name));
        break;
      case 'categories':
        this.inventory.services.sort((m, n) => m.category.localeCompare(n.category));
        break;
        case 'engagements':
          this.inventory.services.sort((m, n) => m.engagements - n.engagements );
          this.sortBy = 'quantity';
          break;
      case 'added':
        this.inventory.services.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        break;
        default:
        break;
    }
  }
    return  inventory;
}
  export const searchPatients = (patients, name) : Person[] => {
   const p = patients.filter((patient) => {
      const pattern  = new RegExp('\^' + name, 'i');
      return pattern.test(patient.info.personal.firstName);
  });
   return p;
};
  export const si = (patients, name) : Person[] => {
   const p = patients.filter((patient) => {
      const pattern  = new RegExp('\^' + name, 'i');
      return pattern.test(patient.info.personal.firstName);
  });
   return p;
};
  export const signStock = (stockItem) => {
  const sign = (!stockItem.form) ? stockItem.name : `${stockItem.form}${stockItem.name}${stockItem.size}${stockItem.unit}`;
  return sign.toLowerCase();
};
  export const updateVitals = (newVitals, curentVital) => {
    if (newVitals.tempreture.value) {
      curentVital.tempreture.unshift(newVitals.tempreture);
    }
    if (newVitals.bp.systolic) {
      newVitals.bp.systolic = newVitals.bp.systolic.split('/')[0];
      newVitals.bp.diastolic = newVitals.bp.systolic.split('/')[1];
      curentVital.bp.stamp = stampItem();
      curentVital.bp.unshift(newVitals.bp);
    }
    if (newVitals.pulse.value) {
      newVitals.pulse.stamp = stampItem();
      curentVital.pulse.unshift(newVitals.pulse);
    }
    if (newVitals.resp.value) {
      newVitals.resp.stamp = stampItem();
      curentVital.resp.unshift(newVitals.resp);
    } else {}
    return curentVital;
};
  export const  stamp = () => new Stamp(localStorage.getItem('i'), localStorage.getItem('h'));


