  import {Person} from '../models/person.model';
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
  export const searchPatients = (patients, name) : Person[] => {
   const p = patients.filter((patient) => {
      const pattern  = new RegExp('\^' + name, 'i');
      return pattern.test(patient.info.personal.firstName);
  });
   return p;
};