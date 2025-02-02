export interface Slot {
  Title: string;
  Start: Date;
  End: Date;
  Resource: string;
  Status?: string;
  UserId?: string;
  UserName?: string;
  UserPhone?: string;
}

export interface FormData {
  Name: string;
  Phone: string;
} 