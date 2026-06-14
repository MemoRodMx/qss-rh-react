export interface PositionOption {
  code: string;
  name: string;
}

export interface SettingsConfig {
  position_ids: string[];
}

export interface AreaOption {
  code: string;
  name: string;
}

export interface SettingsPayload {
  company_id: string;
  recorrido_area_codes: string[];
}
