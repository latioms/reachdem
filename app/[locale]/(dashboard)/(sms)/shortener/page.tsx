import { getLang } from "@/lib/lang";
import { getDictionary } from "../../../dictionaries";
import { UrlShortenerClient } from "@/components/shortener/url-shortener-client";

export default async function ShortenerPage() {
  const lang = await getLang();
  const t = await getDictionary(lang);

  const dictionary = (t as any).shortener ?? {
    title: lang === "fr" ? "Raccourcisseur d'URL" : "URL Shortener",
    subtitle:
      lang === "fr"
        ? "Créez des liens courts et suivez leurs performances"
        : "Create short links and track their performance",
    urlLabel: "URL",
    urlPlaceholder:
      lang === "fr"
        ? "https://example.com/ma-longue-url"
        : "https://example.com/my-long-url",
    slugLabel: lang === "fr" ? "Alias (optionnel)" : "Slug (optional)",
    slugPlaceholder: lang === "fr" ? "mon-lien" : "my-link",
    shortenButton: lang === "fr" ? "Raccourcir" : "Shorten",
    shortLink: lang === "fr" ? "Lien court" : "Short Link",
    originalUrl: lang === "fr" ? "URL d'origine" : "Original URL",
    createdAt: lang === "fr" ? "Créé le" : "Created",
    actions: "Actions",
    copied: lang === "fr" ? "Copié !" : "Copied!",
    noLinks:
      lang === "fr"
        ? "Aucun lien raccourci pour le moment"
        : "No shortened links yet",
    deleteConfirm:
      lang === "fr"
        ? "Supprimer ce lien ?"
        : "Delete this link?",
    loadMore: lang === "fr" ? "Charger plus" : "Load more",
  };

  return (
    <section className="py-15">
      <h1 className="text-2xl font-semibold mb-6">
        {dictionary.title}
      </h1>
      <UrlShortenerClient dictionary={dictionary} />
    </section>
  );
}
