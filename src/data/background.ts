export interface Education {
  period: string;
  institution: string;
  location: string;
  degree: string;
  field: string;
  detail?: string;
}

export interface ProfessionalHighlight {
  year: string;
  title: string;
  role: string;
  organization: string;
  description: string;
}

export interface Certification {
  year: string;
  title: string;
  category: string;
}

export const education: Education[] = [
  {
    period: '2020 — 2024',
    institution: 'STMIK Pranata Indonesia',
    location: 'Bekasi',
    degree: 'Bachelor Degree',
    field: 'Information Systems',
    detail: 'GPA 3.44 / 4.00',
  },

  {
    period: '2010 — 2013',
    institution: 'SMK Ristek Jaya',
    location: 'Jakarta Timur',
    degree: 'Vocational High School',
    field: 'Automotive',
  },
];


export const professionalHighlights: ProfessionalHighlight[] = [
  {
    year: '2023',
    title: 'Capability Building TAD',
    role: 'Speaker',
    organization: 'PT Bank Mandiri Tbk. — Government Solution Group',
    description:
      'Delivered a session about BPJS Kesehatan and BPJS Ketenagakerjaan for TAD participants.',
  },

  {
    year: '2024',
    title: 'Job Fair Kabupaten Tangerang',
    role: 'Company Representative',
    organization: 'PT Sumberdaya Andalan Mandiri (mPro)',
    description:
      'Represented the company during the government-organized Job Fair Kabupaten Tangerang.',
  },

  {
    year: '2025',
    title: 'Employee Gathering mPro',
    role: 'Committee Chairman',
    organization: 'PT Sumberdaya Andalan Mandiri (mPro)',
    description:
      'Served as committee chairman for the company Employee Gathering held in Bandung.',
  },
];


export const certifications: Certification[] = [
  {
    year: '2022',
    title: 'Awareness Training SNI ISO 45001:2018',
    category: 'Occupational Health & Safety',
  },

  {
    year: '2022',
    title: 'Awareness Training SNI ISO 37001:2016',
    category: 'Anti-Bribery Management System',
  },

  {
    year: '2022',
    title: 'Become a Reliable Modern Web Developer',
    category: 'Web Development',
  },

  {
    year: '2023',
    title: 'Peluang Kerja dan Peran Manajemen Data dalam Transformasi Digital',
    category: 'Data & Digital Transformation',
  },

  {
    year: '2023',
    title: 'Memahami Objek dan Komponen PPh21',
    category: 'Taxation',
  },

  {
    year: '2023',
    title: 'Metode Penghitungan PPh21',
    category: 'Taxation',
  },

  {
    year: '2023',
    title: 'Digital Technology Development pada Era Industrial Revolution 4.0 & Society 5.0',
    category: 'Digital Technology',
  },
];