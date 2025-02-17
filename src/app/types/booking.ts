export interface Service {
  name: string;
  price: number;
  duration: string;
  description: string;
}

export interface FormData {
  Name: string;
  Phone: string;
} 

export interface Barber {
  Id: string;
  Phone: string;
  Name: string;
  Status: boolean;
}

export interface User {
  Id: string;
  Phone: string;
  Name: string;
}

export interface DbBookedSlot {
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

export interface SupabaseError {
  message: string;
  status: number;
}

export interface NumVerifyResponse {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  carrier: string;
}