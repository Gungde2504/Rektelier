import { useEffect } from 'react';

const SITE_NAME = 'Rektelier';
const DEFAULT_DESC =
  'Rektelier adalah studio arsitektur. Jelajahi proyek residensial, komersial, dan kompetisi kami.';
const SITE_URL = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function absoluteUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url}`;
}

export default function Seo({ title, description, image, path, type = 'website', noindex = false, jsonLd }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Studio Arsitektur`;
    const desc = description || DEFAULT_DESC;
    const url = `${SITE_URL}${path ?? window.location.pathname}`;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setCanonical(url);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image ? absoluteUrl(image) : '');
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : '');

    let ld = document.getElementById('seo-jsonld');
    if (jsonLd) {
      if (!ld) {
        ld = document.createElement('script');
        ld.id = 'seo-jsonld';
        ld.type = 'application/ld+json';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify(jsonLd);
    } else if (ld) {
      ld.remove();
    }
  }, [title, description, image, path, type, noindex, jsonLd]);

  return null;
}