export interface Theme {
  primary: string[];
  secondary: string[];
  textColor: string;
  accentColor: string;
  bannerText: string;
  saleText: string;
  headerTextColor: string;
}

export const themes: Record<string, Theme> = {
  all: {
    primary: ['rgb(34, 197, 94)', 'rgb(74, 222, 128)', 'rgb(134, 239, 172)', 'rgb(187, 247, 208)'],
    secondary: ['rgb(187, 247, 208)', 'rgb(134, 239, 172)', 'rgb(74, 222, 128)'],
    textColor: '#1a1a1a',
    accentColor: '#000',
    bannerText: 'HOUSEFULL',
    saleText: 'SALE',
    headerTextColor: '#ffffff',
  },
  wedding: {
    primary: ['rgb(252, 165, 165)', 'rgb(253, 182, 182)', 'rgb(254, 202, 202)', 'rgb(255, 228, 228)'],
    secondary: ['rgb(255, 228, 228)', 'rgb(254, 202, 202)', 'rgb(253, 182, 182)'],
    textColor: '#7f1d1d',
    accentColor: '#991b1b',
    bannerText: 'WEDDING',
    saleText: 'SALE',
    headerTextColor: '#7f1d1d',
  },
  winter: {
    primary: ['rgb(186, 230, 253)', 'rgb(191, 234, 255)', 'rgb(207, 250, 254)', 'rgb(224, 242, 254)'],
    secondary: ['rgb(224, 242, 254)', 'rgb(207, 250, 254)', 'rgb(191, 234, 255)'],
    textColor: '#0c4a6e',
    accentColor: '#075985',
    bannerText: 'WINTER',
    saleText: 'SALE',
    headerTextColor: '#0c4a6e',
  },
  electronics: {
    primary: ['rgb(253, 224, 71)', 'rgb(253, 230, 138)', 'rgb(254, 240, 138)', 'rgb(254, 249, 195)'],
    secondary: ['rgb(254, 249, 195)', 'rgb(254, 240, 138)', 'rgb(253, 230, 138)'],
    textColor: '#713f12',
    accentColor: '#854d0e',
    bannerText: 'ELECTRONICS',
    saleText: 'SALE',
    headerTextColor: '#713f12',
  },
  beauty: {
    primary: ['rgb(251, 207, 232)', 'rgb(252, 218, 238)', 'rgb(253, 224, 239)', 'rgb(254, 240, 246)'],
    secondary: ['rgb(254, 240, 246)', 'rgb(253, 224, 239)', 'rgb(252, 218, 238)'],
    textColor: '#831843',
    accentColor: '#9f1239',
    bannerText: 'BEAUTY',
    saleText: 'SALE',
    headerTextColor: '#831843',
  },
  grocery: {
    primary: ['rgb(187, 247, 208)', 'rgb(209, 250, 229)', 'rgb(220, 252, 231)', 'rgb(236, 253, 245)'],
    secondary: ['rgb(236, 253, 245)', 'rgb(220, 252, 231)', 'rgb(209, 250, 229)'],
    textColor: '#14532d',
    accentColor: '#166534',
    bannerText: 'GROCERY',
    saleText: 'SALE',
    headerTextColor: '#14532d',
  },
  fashion: {
    primary: ['rgb(196, 181, 253)', 'rgb(205, 192, 255)', 'rgb(221, 214, 254)', 'rgb(237, 233, 254)'],
    secondary: ['rgb(237, 233, 254)', 'rgb(221, 214, 254)', 'rgb(205, 192, 255)'],
    textColor: '#4c1d95',
    accentColor: '#5b21b6',
    bannerText: 'FASHION',
    saleText: 'SALE',
    headerTextColor: '#4c1d95',
  },
  sports: {
    primary: ['rgb(147, 197, 253)', 'rgb(165, 208, 255)', 'rgb(191, 219, 254)', 'rgb(219, 234, 254)'],
    secondary: ['rgb(219, 234, 254)', 'rgb(191, 219, 254)', 'rgb(165, 208, 255)'],
    textColor: '#1e3a8a',
    accentColor: '#1e40af',
    bannerText: 'SPORTS',
    saleText: 'SALE',
    headerTextColor: '#1e3a8a',
  },
};

export const getTheme = (tabId: string): Theme => {
  return themes[tabId] || themes.all;
};

