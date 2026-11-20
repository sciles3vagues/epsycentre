/** Main navigation — shared by the desktop and mobile headers (and later the footer). */
export interface NavLink {
  label: string;
  /** Longer label used in the mobile menu when it differs (Figma "Menu hamburger ouvert"). */
  mobileLabel?: string;
  href: string;
}

export const NAV_LINKS = [
  { label: 'Notre centre', href: '/#notre-centre' },
  { label: 'L’équipe', mobileLabel: 'Les membres de l’équipe', href: '/#equipe' },
  { label: 'Les TCCE', href: '/#tcce' },
  { label: 'Les groupes', href: '/#groupes' },
  { label: 'Accès', href: '/#acces' },
  { label: 'FAQ', href: '/#faq' },
] as const satisfies readonly NavLink[];
