export interface Experience {
  period: string;
  position: string;
  company: string;
  location?: string;
  description: string;
  responsibilities?: string[];
  tags?: string[];
}

export const experiences: Experience[] = [
  {
    period: 'NOV 2021 — PRESENT',

    position: 'Staff HC & TAD',

    company: 'PT Sumberdaya Andalan Mandiri (mPro)',

    location: 'Jakarta Selatan',

    description:
      'Supporting Human Capital and TAD operations through employee administration, social security administration, employee database management, reporting, documentation, and additional support for company website and web application maintenance.',

    responsibilities: [
      'BPJS Ketenagakerjaan administration',
      'BPJS Kesehatan administration',
      'Employee database administration',
      'Reporting and document filing',
      'Maintenance and updates of company website and web applications',
    ],

    tags: [
      'Human Capital',
      'BPJS Administration',
      'Employee Database',
      'Documentation',
      'Web Maintenance',
    ],
  },

  {
    period: 'OCT 2019 — JAN 2020',

    position: 'Benefit Staff',

    company: 'PT Perkasa Abdi Bhuana (Prabhu)',

    location: 'Tambun Selatan',

    description:
      'Handled employee benefit administration, social security programs, additional insurance, employee databases, reporting, and administrative documentation.',

    responsibilities: [
      'BPJS Ketenagakerjaan administration',
      'BPJS Kesehatan administration',
      'Additional insurance administration for Reliance and Inhealth',
      'Employee database administration',
      'Reporting and document filing',
    ],

    tags: [
      'Benefit Administration',
      'BPJS',
      'Insurance',
      'Employee Database',
    ],
  },

  {
    period: 'JUL 2019 — SEP 2019',

    position: 'Staff HRD BPJS',

    company: 'PT Auraluxe Indonesia',

    location: 'Jakarta Pusat',

    description:
      'Supported HR administration with a primary focus on employee social security programs, employee database management, reporting, and document filing.',

    responsibilities: [
      'BPJS Ketenagakerjaan administration',
      'BPJS Kesehatan administration',
      'Employee database administration',
      'Reporting and document filing',
    ],

    tags: [
      'Human Resources',
      'BPJS Administration',
      'Employee Database',
    ],
  },

  {
    period: 'DEC 2018 — MAY 2019',

    position: 'HR & GA Officer',

    company: 'PT Timas Suplindo — Pindo Deli 3 Project',

    location: 'KIIC Karawang',

    description:
      'Managed Human Resources and General Affairs administration for the project, covering recruitment, employment contracts, payroll, compensation and benefits, and employee documentation.',

    responsibilities: [
      'Recruitment and employee contract administration',
      'Employee database administration',
      'Payroll administration',
      'Compensation and benefits administration',
      'Reporting and document filing',
    ],

    tags: [
      'Human Resources',
      'General Affair',
      'Recruitment',
      'Payroll',
      'Compensation & Benefit',
    ],
  },

  {
    period: 'OCT 2017 — DEC 2018',

    position: 'Payroll Officer',

    company: 'PT Timas Suplindo — APR / IKBB Project',

    location: 'Pelalawan, Riau',

    description:
      'Managed payroll administration and employee compensation and benefits while maintaining supporting reports and employment documentation.',

    responsibilities: [
      'Payroll administration',
      'Compensation and benefits administration',
      'Reporting and document filing',
    ],

    tags: [
      'Payroll',
      'Compensation & Benefit',
      'Administration',
    ],
  },

  {
    period: 'APR 2015 — JUN 2017',

    position: 'HR & GA Staff',

    company: 'PT Timas Suplindo — Oki Pulp & Paper Mills',

    location: 'Palembang',

    description:
      'Supported Human Resources and General Affairs operations through payroll administration, compensation and benefits, attendance management, reporting, and document filing.',

    responsibilities: [
      'Payroll administration',
      'Compensation and benefits administration',
      'Company attendance management',
      'Reporting and document filing',
    ],

    tags: [
      'Human Resources',
      'General Affair',
      'Payroll',
      'Attendance Management',
    ],
  },
];