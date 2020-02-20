  import {Person} from '../models/person.model'
  export default  (patients: Person[], order: string) =>  {
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
         new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
        break;
        default:
        break;
    }
  }