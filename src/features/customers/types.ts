export interface Coverage {
  shift: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  monday_off: number;
  tuesday_off: number;
  wednesday_off: number;
  thursday_off: number;
  friday_off: number;
  saturday_off: number;
  sunday_off: number;
  workday_type?: string;
}

export interface OptimalContracted {
  _id?: string;
  position: string;
  salary: number;
  bonus: number;
  coverage: Coverage[];
}

export interface CustomerAddress {
  street?: string;
  number?: string;
  interior?: string;
  colony?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface CustomerPlantRef {
  plant_id: { _id: string; code: string; name: string } | null;
}

export interface Customer {
  _id: string;
  company_id: string | { _id: string; legal_name: string };
  area_code: string;
  rfc: string;
  legal_name: string;
  address?: CustomerAddress;
  contract_date: string | null;
  left_date: string | null;
  readmission_date: string | null;
  optimal_contracted: OptimalContracted[];
  plants?: CustomerPlantRef[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormValues {
  company_id: string;
  area_code: string;
  rfc: string;
  legal_name: string;
  contract_date: string | null;
  left_date: string | null;
  readmission_date: string | null;
  addr_street: string;
  addr_number: string;
  addr_interior: string;
  addr_colony: string;
  addr_city: string;
  addr_state: string;
  addr_zipcode: string;
  status: string;
}

export interface SelectOption {
  _id: string;
  name: string;
  code?: string;
}

export interface CsfAddress {
  street: string;
  number: string;
  interior: string;
  colony: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface CsfData {
  rfc: string;
  legal_name: string;
  address: CsfAddress;
}
