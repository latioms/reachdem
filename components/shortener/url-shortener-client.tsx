"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Link2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createShortLink,
  deleteShortLink,
  type ShortenedLink,
} from "@/app/actions/shortener/shortener";

const RCDM_BASE = "https://rcdm.ink";
const STORAGE_KEY = "reachdem:short-links";

interface UrlShortenerClientProps {
  dictionary: {
    title: string;
    subtitle: string;
    urlLabel: string;
    urlPlaceholder: string;
    slugLabel: string;
    slugPlaceholder: string;
    shortenButton: string;
    shortLink: string;
    originalUrl: string;
    createdAt: string;
    actions: string;
    copied: string;
    noLinks: string;
    deleteConfirm: string;
    loadMore: string;
  };
}

export function UrlShortenerClient({ dictionary: t }: UrlShortenerClientProps) {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<ShortenedLink[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLinks(JSON.parse(stored));
    } catch { /* ignore corrupt data */ }
  }, []);

  const persistLinks = (updated: ShortenedLink[]) => {
    setLinks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleShorten = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const link = await createShortLink(url.trim(), slug.trim() || undefined);
      toast.success(`${RCDM_BASE}/${link.slug}`);
      setUrl("");
      setSlug("");
      persistLinks([link, ...links]);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du raccourcissement");
    } finally {
      setLoading(false);
    }
  };

  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    if (!confirm(t.deleteConfirm)) return;
    setDeletingSlug(slug);
    try {
      await deleteShortLink(slug);
    } catch {
      // API delete may fail but we still clean up locally
    }
    persistLinks(links.filter((l) => l.slug !== slug));
    toast.success("Lien supprimé");
    setDeletingSlug(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.copied);
  };

  return (
    <div className="space-y-6">
      {/* Create short link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="url">{t.urlLabel}</Label>
              <Input
                id="url"
                type="url"
                placeholder={t.urlPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              />
            </div>
            <div className="w-full sm:w-48 space-y-2">
              <Label htmlFor="slug">{t.slugLabel}</Label>
              <Input
                id="slug"
                placeholder={t.slugPlaceholder}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              />
            </div>
            <Button onClick={handleShorten} disabled={loading || !url.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.shortenButton
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.shortLink}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t.originalUrl}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t.createdAt}
                </TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    {t.noLinks}
                  </TableCell>
                </TableRow>
              )}
              {links.map((link, index) => (
                <TableRow key={link.id ?? `${link.slug}-${index}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">
                        {RCDM_BASE}/{link.slug}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          copyToClipboard(`${RCDM_BASE}/${link.slug}`)
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground truncate max-w-[300px]"
                    >
                      {link.url}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {link.createdAt
                      ? new Date(link.createdAt * 1000).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(link.slug)}
                      disabled={deletingSlug === link.slug}
                    >
                      {deletingSlug === link.slug ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
