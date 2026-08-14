export interface SkillGroup {
  number: string;
  title: string;
  description: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    number: '01',
    title: 'Human Capital & HR Operations',
    description:
      'Experience in employee administration and Human Capital operational processes across several industries and project environments.',
    skills: [
      'Human Capital Administration',
      'BPJS Ketenagakerjaan',
      'BPJS Kesehatan',
      'Payroll Administration',
      'Compensation & Benefit',
      'Recruitment Administration',
      'Employee Database',
      'Attendance Management',
      'Reporting & Documentation',
    ],
  },

  {
    number: '02',
    title: 'Office & Productivity',
    description:
      'Productivity tools used for administration, reporting, data processing, presentation, and collaborative work.',
    skills: [
      'Microsoft Excel',
      'Microsoft Word',
      'Microsoft PowerPoint',
      'Microsoft Access',
      'Google Sheets',
      'Google Docs',
      'Google Forms',
      'Google Slides',
    ],
  },

  {
    number: '03',
    title: 'Web & Development',
    description:
      'Technical capabilities developed through website maintenance, personal learning, and internal web application development.',
    skills: [
      'PHP',
      'VB.Net',
      'WordPress',
      'Elementor',
      'Sublime Text',
      'Website Maintenance',
      'Web Application Maintenance',
      'Hostinger',
    ],
  },

  {
    number: '04',
    title: 'Database & HR Systems',
    description:
      'Experience working with databases and digital platforms supporting administrative and Human Capital processes.',
    skills: [
      'Microsoft SQL Server',
      'phpMyAdmin',
      'eDabu BPJS Kesehatan',
      'SIPP BPJS Ketenagakerjaan',
      'Employee Data Management',
    ],
  },
];