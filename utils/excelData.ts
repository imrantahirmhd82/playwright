import * as XLSX from 'xlsx';
import { RegistrationDetails } from '../pages/SignupPage';

export type LoginValidation = {
  scenario: string;
  email: string;
  password: string;
};

const workbookPath = 'testData/Users.xlsx';

function readSheet<T>(sheetName: string): T[] {
  const workbook = XLSX.readFile(workbookPath);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Missing worksheet: ${sheetName}`);
  }
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: '' });
}

export function getRegistrationData(scenario = 'registration'): RegistrationDetails {
  const registration = readSheet<RegistrationDetails & { scenario?: string }>('User Registration')
    .find(row => row.scenario === scenario);
  if (!registration) {
    throw new Error(`Missing registration scenario: ${scenario}`);
  }
  return registration;
}

export function saveRegistrationData(scenario: string, data: RegistrationDetails): void {
  const workbook = XLSX.readFile(workbookPath);
  const rows = readSheet<RegistrationDetails & { scenario?: string }>('User Registration')
    .filter(row => row.scenario !== scenario);
  rows.push({ scenario, ...data });
  workbook.Sheets['User Registration'] = XLSX.utils.json_to_sheet(rows);
  XLSX.writeFile(workbook, workbookPath);
}

export function getLoginData(scenario: string): LoginValidation {
  const loginData = readSheet<LoginValidation>('User Login');
  const login = loginData.find(row => row.scenario === scenario);
  if (!login) {
    throw new Error(`Missing login scenario: ${scenario}`);
  }
  return login;
}

export function getTestData(key: string): string {
  const row = readSheet<{ key: string; value: string }>('Test Data')
    .find(entry => entry.key === key);
  if (!row) {
    throw new Error(`Missing test data key: ${key}`);
  }
  return row.value;
}
