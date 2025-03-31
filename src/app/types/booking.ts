export interface Service {
  name: string;
  price: number;
  duration: string;
  description: string;
}

export interface Barber {
  Id: string;
  Phone: string;
  Name: string;
  Password: string;
  Status: boolean;
}

export type User = {
  Id: string;
  Name: string;
  Phone: string;
  Status: boolean;
};

export interface DbBookedSlot {
  Id: string;
  StartTime: string;
  EndTime: string;
  Status: boolean;
  Users: User; // It's just one User object
  Barbers: Barber; // It's just one Barber object
}

export interface BookingSlotVM {
  Start: Date;
  End: Date;
  Status?: boolean;
  UserName: string;
  UserPhone: string;
  BarberId: string;
  BarberName: string;
  BarberPhone: string;
}

export interface BookingFormData {
  Name: string;
  Phone: string;
}
