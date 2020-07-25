let client = await Client.findById(req.cookies.h)
console.log(client.inventory.length);
    let stocks = [];
    let services = [];
    client.inventory = client.inventory.map(function(i) {
      if(i.type === 'Products') {
        stocks.push({
          product: {
            name: i.item.name.split(' ')[0],
            conc: null,
            size: null,
            unit: null,
            expiry: null,
            category: null
        },
        stockInfo: {
          expiry: null,
          price: null,
          expired: false,
          status: false,
          quantity: null,
          inStock: null 
        }
        })
      } else if (i.type ==='Services') {
        services.push({
          name: i.item.name,
          engagements: null,
          category:null
        })
      } else {}
      rturn ({stocks:stocks, services:services})
    })

//second modification
    let {inventory} = await Client.findById(req.cookies.h).lean()
    let stocks = [];
    let services = [];
    inventory.services = inventory.services.map(s => ({
      name: s.name,
      stockInfo: {
        expiry: null,
        price: null,
        expired: false,
        status: false,
        quantity: null,
        inStock: null 
      }
    }))
    let ui = await Client.findOneAndUpdate({'info.city': null}, {inventory: inventory})
    console.log(ui.services);