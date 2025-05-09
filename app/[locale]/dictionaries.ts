import 'server-only'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  fr: () => import('./dictionaries/fr.json').then((module) => module.default),
}

type Locale = keyof typeof dictionaries;

const getDictionary = async (locale: string) => {
  // Ensure the locale is valid, defaulting to 'en' if not
  const safeLocale = (locale in dictionaries) ? locale as Locale : 'en';
  return dictionaries[safeLocale]();
}

export { getDictionary }