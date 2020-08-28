var mongoose = require('../db');
const Schema = mongoose.Schema;
const personSchema = new Schema({
    info: {
        status: String,
        online: Boolean,
        lastLogin: Date,
        personal: {
            firstName: String,
            lastName: String,
            gender: String,
            dob: Date,
            avatar: String,
            cardType: String,
            cardNum: Number,
            bio: String,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            username: String,
            password: String,
            status: String
        },
        contact: {
            me: {
                mobile: String,
                email: String,
                kinName: String,
                kinMobile: String,
                state: String,
                lga: String,
                address: String
            },
            emergency: {
                name: String,
                mobile: String,
                email: String,
                rel: String,
                occupation: String,
                address: String
            }
        },
        insurance: {
            rel: String,
            idNo: String,
            groupNo: String,
            subscriber: String,
            employer: String,
            ssn: String 
        },
        official: {
            hospital: {
                type: Schema.Types.ObjectId,
                ref: 'Client'
            },
            id: String,
            department: String,
            role: String
        }
    },
    record: {
        complains: [
            [{
                complain: String,
                piriod: String,
                duration: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        histories: [{
            pc: [{
                name: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            fsh: [{
                name: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            pmh: {
                allegies: [
                    {
                        name: String,
                        stamp: {
                            addedBy: {
                                type: Schema.Types.ObjectId,
                                ref: 'Person'
                            },
                            facility: {
                                type: Schema.Types.ObjectId,
                                ref: 'Client'
                            },
                            selected: Boolean,
                            dateAdded: Date
                        }
                    }
                ],
                medHist: [
                    {
                        name: String,
                        stamp: {
                            addedBy: {
                                type: Schema.Types.ObjectId,
                                ref: 'Person'
                            },
                            facility: {
                                type: Schema.Types.ObjectId,
                                ref: 'Client'
                            },
                            selected: Boolean,
                            dateAdded: Date
                        }
                    }
                ]
            },
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        examinations: [
            [
                {
                    name: String,
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                }
            ]
        ],
        notes: [{
            note: String,
            noteType: String,
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        vitals: {
            bp: [{
                systolic: Number,
                dystolic: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            resp: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            pulse: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            height: [{
                value: Number,
                dateAdded: Date
            }],
            weight: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            tempreture: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            bloodGl: [{
                value: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        },
        conditions: [
            [{
                name: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        visits: [
            [{
                hospital: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                dept: String,
                status: String,
                visitedOn: Date,
                addmittedOn: Date,
                dischargedOn: Date,
                diedOn: Date,
                wardNo: Number,
                bedNo: Number
            }]
        ],
        appointments: [{
            title: String,
            setOn: Date,
            date: Date,
            time: String,
            attended: Boolean,
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        medications: [
            [{
                product: {
                    category: String,
                    name: String,
                    size: Number,
                    unit: String,
                    form: String
                },
                priscription: {
                    intake: Number,
                    freq: String,
                    piriod: Number,
                    duration: String
                },
                lastTaken: Date,
                paused: Boolean,
                pausedOn: Date,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        investigations:{
            tests: [
                [{
                    name: String,
                    dept: String,
                    urgency: String,
                    treated: Boolean,
                    report: {
                        comment: String,
                        attachments: [],
                        stamp: {
                            addedBy: {
                                type: Schema.Types.ObjectId,
                                ref: 'Person'
                            },
                            facility: {
                                type: Schema.Types.ObjectId,
                                ref: 'Client'
                            },
                            selected: Boolean,
                            dateAdded: Date
                        }
                    },
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                }]
            ],
            scans: [
                [{
                    name: String,
                    dept: String,
                    urgency: String,
                    treated: Boolean,
                    bodyPart: String,
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    },
                    report: {
                        comment: String,
                        attachments: [],
                        stamp: {
                            addedBy: {
                                type: Schema.Types.ObjectId,
                                ref: 'Person'
                            },
                            facility: {
                                type: Schema.Types.ObjectId,
                                ref: 'Client'
                            },
                            selected: Boolean,
                            dateAdded: Date
                        }
                    }
                }]
            ]
        },
        cards:[],
        surgeries: [
            [{
                name: String,
                dept: String,
                treated: Boolean,
                report: {
                    comment: String,
                    attachments: [],
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                },
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        immunization: {
            vaccins: [
                [{
                    name: String,
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                }]
            ],
            questionaire: {}
        },
        invoices: [
            [{
                name: String,
                desc: String,
                kind: String,
                price: Number,
                quantity: Number,
                paid: Boolean,
                credit: Boolean,
                processed: Boolean,
                datePaid: String,
                comfirmer: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        deathNote: {}
    },
    messages: [{
        contactId: String,
        chats: [
            [
                {
                    message: String,
                    sender: String,
                    reciever: String,
                    delivered: Boolean,
                    read: Boolean,
                    sendOn: Date
                }
            ]
        ]
    }
  ],
  stamp: {
            addedBy: {
                type: Schema.Types.ObjectId,
                ref: 'Person'
            },
            facility: {
                type: Schema.Types.ObjectId,
                ref: 'Client'
            },
            selected: Boolean,
            dateAdded: Date
        }
},{timestamps: true});


const Person = mongoose.model('Person', personSchema);
module.exports = Person;