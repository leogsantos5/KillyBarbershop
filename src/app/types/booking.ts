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

export interface BookingSlotVM {
  Start: Date;
  End: Date;
  Status: string;
  UserName: string;
  UserPhone: string;
}

export interface DbBookedSlot {
  StartTime: string;
  EndTime: string;
  Status: string;
  Users: { UserId: string; Name: string; Phone: string }; 
  // Users is only 1 object, name of property is deceiving (table Users)
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