export interface Barber {
  Id: string;
  Phone: string;
  Name: string;
  Password: string;
  Status: boolean;
}

export interface User {
  Id: string;
  Name: string;
  Phone: string;
  Status: boolean;
};

export interface Service {
  Id: string;
  Name: string;
  Price: number;
  Duration: string;
  Description: string;
}

export interface Reservation {
  Id: string;
  StartTime: string;
  EndTime: string;
  Status: boolean;
  Services: Service; // It's just one Service object
  Users: User; // It's just one User object
  Barbers: Barber; // It's just one Barber object
}

export interface BookingSlotVM {
  Start: Date;
  End: Date;
  Status?: boolean;
  ServiceId: string;
  ServiceName: string;
  ServicePrice: number;
  ServiceDuration: string;
  UserName: string;
  UserPhone: string;
  BarberId: string;
  BarberName: string;
  BarberPhone: string;
}

export interface BookingFormData {
  Name: string;
  Phone: string;
  ServiceId: string;
}
