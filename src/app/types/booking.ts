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
  UserId: string;
  Users: {
    Name: string;
    Phone: string;
  }[];
}
export interface SupabaseError {
  message: string;
  status: number;
}
