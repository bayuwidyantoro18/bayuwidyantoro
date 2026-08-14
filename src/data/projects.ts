export type ProjectCategory =
  | 'Internal System'
  | 'Web Development'
  | 'Automation'
  | 'Administration';

export interface Project {
  number: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  year: string;
  description: string;
  technologies: string[];
  image?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    number: '01',
    title: 'mPro Internal System',
    subtitle: 'Employee Contract Management System',
    category: 'Internal System',
    year: '2026',
    description:
      'Internal web application designed to manage employee contract administration, employee data, PKWT documents, approval processes, reporting, and Excel-based data import.',
    technologies: [
      'Laravel',
      'Vue.js',
      'AdminLTE',
      'MySQL',
      'REST API',
    ],
    image: '/images/projects/sikopin.png',
    featured: true,
  },

  {
    number: '02',
    title: 'Vehicle Reservation System',
    subtitle: 'Driver & Operational Vehicle Booking',
    category: 'Internal System',
    year: '2026',
    description:
      'Internal reservation system for operational vehicles and drivers, including scheduling, approval, trip status, real-time location records, history, and reporting.',
    technologies: [
      'Laravel',
      'Vue.js',
      'MySQL',
      'Geolocation',
      'PWA',
    ],
    image: '/images/projects/reservasi-kendaraan.png',
    featured: true,
  },

  {
    number: '03',
    title: 'Internal Document Numbering',
    subtitle: 'Corporate Letter Number Management',
    category: 'Internal System',
    year: '2026',
    description:
      'Web application for generating and managing corporate document numbers, history, bulk Excel import, reporting, and document activity tracking.',
    technologies: [
      'Laravel',
      'Vue.js',
      'MySQL',
      'Excel Import',
      'PDF Export',
    ],
    image: '/images/projects/nomor-surat.png',
  },

  {
    number: '04',
    title: 'mPro Website & Web Apps',
    subtitle: 'Company Website Maintenance',
    category: 'Web Development',
    year: '2024 — 2025',
    description:
      'Maintenance and updates for the mPro corporate website and several internal web applications supporting employee and document administration.',
    technologies: [
      'WordPress',
      'PHP',
      'Web Maintenance',
      'Hostinger',
    ],
    image: '/images/projects/mpro-web.png',
  },

  {
    number: '05',
    title: 'Payroll System',
    subtitle: 'Excel & VBA Based Payroll Automation',
    category: 'Automation',
    year: 'Professional Project',
    description:
      'Development of an Excel-based payroll system for PT Timas Suplindo OPPM Project, including system design, VBA implementation, and Excel Macro automation.',
    technologies: [
      'Microsoft Excel',
      'VBA',
      'Macro',
      'Payroll',
    ],
    image: '/images/projects/payroll-excel.png',
  },

  {
    number: '06',
    title: 'mPro Website Administration',
    subtitle: 'Corporate Website Content Management System',
    category: 'Web Development',
    year: '2026',
    description:
        'Administration dashboard developed to manage the mPro corporate website, including homepage content, business services, company information, career opportunities, job applications, external shortcuts, contact messages, and website settings.',

    technologies: [
        'Laravel',
        'Vue.js',
        'Vuetify',
        'MySQL',
        'REST API',
    ],

    image: '/images/projects/mpro-admin-dashboard.png',
    },
];