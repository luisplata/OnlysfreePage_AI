
import type { LucideIcon } from 'lucide-react';

// Interface for items from /api/packs (used by /api/model/[id] as well for structure)
export interface ApiPack {
  id: number;
  nombre: string;
  imagen: string;
  NombreLink: string;
  hotLink: string;
  isVideo: string; // "0", "1", or ""
  url_video: string;  // Video URL if isVideo is "1" for /api/packs
  tags: string;
  visitas?: object; // Specific to /api/model/[id] response
}

// Interface for items from /api/ppv (list and single item detail)
export interface ApiPpvItem {
  id: number;
  nombre: string;
  imagen: string;
  url: string; // This is the direct streaming link for PPV, used for iframe
  tags: string;
  created_at?: string;
  updated_at?: string;
  estado?: string;
  publication_date?: string;
}

// Interface for items from /api/hot
export interface ApiHotItem {
  id: number; // This seems to be the pack/model ID
  nombre: string;
  imagen: string;
  NombreLink: string;
  hotLink: string;
  isVideo: string; // "0", "1", or ""
  url_video: string;
  tags: string;
  visita: string; // Number of visits as a string
  idoAlPack: string; // Number of clicks to pack as a string
  producto_id: string; // This seems to be the actual product ID for linking.
}


// Generic Product interface to be used in the UI
export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  productType: 'standard' | 'streaming';
  videoUrl?: string; // URL for embedding/direct video playback or iframe
  hotLink?: string;  // External link (e.g., for /api/packs or the PPV URL itself)
}

export interface SaleCategory {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon; // For the main sidebar card
}

// API response for the list of packs from /api/packs
export interface ApiPackListResponse {
  current_page: number;
  data: ApiPack[];
  // ... other pagination fields
}

// API response for a single model/pack detail from /api/model/[id]
export type ApiModelDetailResponse = ApiPack;

// API response for the list of PPV items from /api/ppv
export interface ApiPpvListResponse {
  current_page: number;
  data: ApiPpvItem[];
  // ... other pagination fields
}

// API response for a single PPV item detail from /api/ppv/[id]
export type ApiPpvDetailResponse = ApiPpvItem;

// API response for /api/hot is a direct array of ApiHotItem
export type ApiHotListResponse = ApiHotItem[];
