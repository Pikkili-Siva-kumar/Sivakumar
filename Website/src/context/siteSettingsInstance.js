import { createContext } from 'react';

export const DEFAULT_SETTINGS = {
  site_name: 'Siva Kumar',
  site_description: 'Python Full Stack Developer building practical web applications and reliable backend systems.',
  contact_email: 'pikkilisivakumar07@gmail.com',
  contact_phone: '939867XXXX',
  linkedin_url: 'https://linkedin.com/in/siva-kumar',
  github_url: 'https://github.com/SivaKumarPikkili',
  seo_title: 'Siva Kumar | Professional Brand & Business',
  seo_description: 'Siva Kumar - Professional Personal-Brand & Business',
  maintenance_mode: false,
};

export const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refreshSettings: async () => {},
});

export default SiteSettingsContext;
