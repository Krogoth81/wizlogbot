interface PolAddress {
  street: string
  postalCode: string
  city: string
  gpsCoord: string
  globalLocationNumber: string
  organisationNumber: string
}

interface RegularHours {
  validFromDate: string
  dayOfTheWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  openingTime: string
  closingTime: string
  closed: boolean
}

interface ExceptionHours {
  date: string
  openingTime: string
  closingTime: string
  message: string
  closed: boolean
}

export interface OpeningHours {
  regularHours: Array<RegularHours>
  exceptionHours: Array<ExceptionHours>
}

interface LastChanged {
  date: string
  time: string
}

export interface VinmonopolInfo {
  storeId: string
  storeName: string
  status: 'Open' | 'Closed' | 'Temporarily closed' | 'To be opened'
  address: PolAddress
  telephone: string
  email: string
  category: string
  profile: string
  storeAssortment: string
  openingHours: OpeningHours
  lastChanged: LastChanged
}
