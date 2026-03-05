"use server";

const RCDM_BASE_URL = "https://rcdm.ink";

function getToken() {
  const token = process.env.RCDM_TOKEN;
  if (!token) throw new Error("RCDM_TOKEN is not set");
  return token;
}

export interface ShortenedLink {
  id: string;
  url: string;
  slug: string;
  shortLink?: string;
  comment?: string;
  createdAt?: number;
  updatedAt?: number;
}

export async function createShortLink(
  url: string,
  slug?: string,
  comment?: string
): Promise<ShortenedLink> {
  const body: Record<string, unknown> = { url };
  if (slug) body.slug = slug;
  if (comment) body.comment = comment;

  const response = await fetch(`${RCDM_BASE_URL}/api/link/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create short link: ${text}`);
  }

  const data = await response.json();
  return { ...data.link, shortLink: data.shortLink };
}

export async function listShortLinks(
  limit = 20,
  cursor?: string
): Promise<{ links: ShortenedLink[]; cursor?: string }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(
    `${RCDM_BASE_URL}/api/link/list?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to list links: ${text}`);
  }

  return response.json();
}

export async function deleteShortLink(slug: string): Promise<void> {
  const response = await fetch(`${RCDM_BASE_URL}/api/link/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ slug }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete link: ${text}`);
  }
}
