// let client = await Client.findById(req.cookies.h)
// console.log(client.inventory.length);
//     let stocks = [];
//     let services = [];
//     client.inventory = client.inventory.map(function(i) {
//       if(i.type === 'Products') {
//         stocks.push({
//           product: {
//             name: i.item.name.split(' ')[0],
//             conc: null,
//             size: null,
//             unit: null,
//             expiry: null,
//             category: null
//         },
//         stockInfo: {
//           expiry: null,
//           price: null,
//           expired: false,
//           status: false,
//           quantity: null,
//           inStock: null 
//         }
//         })
//       } else if (i.type ==='Services') {
//         services.push({
//           name: i.item.name,
//           engagements: null,
//           category:null
//         })
//       } else {}
//       rturn ({stocks:stocks, services:services})
//     })

// //second modification
//     let {inventory} = await Client.findById(req.cookies.h).lean()
//     let stocks = [];
//     let services = [];
//     inventory.services = inventory.services.map(s => ({
//       name: s.name,
//       stockInfo: {
//         expiry: null,
//         price: null,
//         expired: false,
//         status: false,
//         quantity: null,
//         inStock: null 
//       }
//     }))
//     let ui = await Client.findOneAndUpdate({'info.city': null}, {inventory: inventory})
//     console.log(ui.services);






//     patients = patients.map(patient => {
//       return ({
//         ...patient, 
//             record: {
//               ...patient.record,
//               invoices: [],
//               medications: [],
//               scans: [],
//               tests: [],
//               visits: patient.visits,
//               allegies: [],
//               notes: [],
//               complains: [],
//               appointments: [],
//               sugeries: [],
//             }
//     }) 
//   })
//   for (p of patients) {
//       Person.findByIdAndUpdate( 
//         mongoose.Types.ObjectId(p._id),{
//           "record": p.record
//         }, {
//           new: true
//         }, (e, docs) => {
//           console.log(docs)
//         if(e) {
//           console.log(e)
//         }
//       })
//   }


//   patients = patients.map(patient => {
//     return ({
//       ...patient, 
//           record: { 
//             complains: [],
//             histories:[],
//             investigations: {},
//             conditions: [],
//             examinations: [],
//             medications: [],
//             immunizations: {},
//             notes: [],
//             visits: [],
//             appointments: [],
//             invoices: [],
//             sugeries: [],
//             deathNote: {},
//           }
//   }) 
// })
// for (p of patients) {
//     Person.findByIdAndUpdate( 
//       mongoose.Types.ObjectId(p._id),{
//         "record": p.record
//       }, {
//         new: true
//       }, (e, docs) => {
//         console.log(docs)
//       if(e) {
//         console.log(e)
//       }
//     })
// }


// patients = patients.map(patient => {
//   return ({
//     ...patient, 
//         record: { 
//           complains: [],
//           histories:[],
//           investigations: {},
//           conditions: [],
//           examinations: [],
//           medications: [],
//           immunizations: {},
//           notes: [],
//           visits: patient.record.visits,
//           appointments: [],
//           invoices: [],
//           sugeries: [],
//           deathNote: {}
//         }
//     }) 
// })
// for (p of patients) {
//   Person.findByIdAndUpdate( 
//     mongoose.Types.ObjectId(p._id),{
//       "record": p.record
//     }, {
//       new: true
//     }, (e, docs) => {
//       console.log(docs)
//     if(e) {
//       console.log(e)
//     }
//   })
// }


  // await Suggestion.deleteMany({category:'test'})
    // let uniques = []
    // data.tests = data.tests.map(t=> {
    //   if(!uniques.some(i=>i===t)) {
    //     uniques.push(t)
    //   }
    // })
    //  uniques = uniques.map(n=>({
    //   name: n, 
    //   category: 'test'
    // }))
    // console.log(uniques.length)
    // await Suggestion.insertMany(uniques,{ordered:false})





    // patients = patients.map(patient => {
    //   return ({
    //     ...patient, 
    //         record: { 
    //           complains: [],
    //           histories:[],
    //           investigations: {},
    //           conditions: [],
    //           examinations: [],
    //           medications: [],
    //           immunizations: {},
    //           notes: [],
    //           cards: patient.record.cards,
    //           visits: patient.record.visits,
    //           appointments: [],
    //           invoices: [],
    //           sugeries: [],
    //           deathNote: {}
    //         }
    //     }) 
    // })
    // for (p of patients) {
    //   Person.findByIdAndUpdate( 
    //     mongoose.Types.ObjectId(p._id),{
    //       "record": p.record
    //     }, {
    //       new: true
    //     }, (e, docs) => {
    //       console.log(docs)
    //     if(e) {
    //       console.log(e)
    //     }
    //   })
    // }
    
    patients = patients.map(patient => {
      return ({
        ...patient, 
            record: { 
              complains: [],
              histories:[],
              investigations: {},
              conditions: [],
              examinations: [],
              medications: [],
              immunizations: {},
              notes: [],
              cards: patient.record.cards,
              visits: patient.record.visits,
              appointments: [],
              invoices: [],
              sugeries: [],
              deathNote: {}
            }
        }) 
    })
    for (p of patients) {
      Person.findByIdAndUpdate( 
        mongoose.Types.ObjectId(p._id),{
          "record": p.record
        }, {
          new: true
        }, (e, docs) => {
          console.log(docs)
        if(e) {
          console.log(e)
        }
      })
     }