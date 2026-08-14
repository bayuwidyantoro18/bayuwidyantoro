export interface ContactInfo {
  label: string;
  value: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
}

export const contactInfo: ContactInfo[] = [
  {
    label: 'Email',
    value: 'bayu.widyantoro24@gmail.com',
    href: 'mailto:bayu.widyantoro24@gmail.com',
  },

  {
    label: 'WhatsApp',
    value: '085364112497',
    href: 'https://wa.me/6285364112497',
  },
];

export const socialLinks: SocialLink[] = [
  /*
  Nanti tambahkan jika link sudah tersedia:

  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/...',
  },

  {
    name: 'GitHub',
    href: 'https://github.com/...',
  },
  */
];