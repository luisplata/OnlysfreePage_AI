
import type { LucideIcon } from 'lucide-react';

// Interface for items from /api/packs
export interface ApiPack {
  id: number;
  nombre: string;
  imagen: string;
  NombreLink: string; // Specific to /api/packs
  hotLink: string;    // Specific to /api/packs
  isVideo: string;    // "0", "1", or ""
  url_video: string;  // Video URL if isVideo is "1"
  tags: string;
}

// Interface for items from /api/ppv
export interface ApiPpvItem {
  id: number;
  nombre: string;
  imagen: string;
  url: string; // This seems to be the direct streaming link for PPV
  tags: string;
  // Fields like estado, publication_date, created_at, updated_at are available
  // but not directly used in the Product interface for now.
}

// Generic Product interface to be used in the UI
export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  productType: 'standard' | 'streaming';
  videoUrl?: string; // URL for embedding/direct video playback
  hotLink?: string;  // External link, often for /api/packs
                     // For PPV, this might be same as videoUrl or not used if videoUrl is embedded
}

export interface SaleCategory {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}

// Interface for the API response for the list of packs from /api/packs
export interface ApiPackListResponse {
  current_page: number;
  data: ApiPack[];
  // ... other pagination fields if needed
}

// Interface for the API response for a single model/pack detail from /api/model/[id]
// This usually matches ApiPack structure, but can have more details like 'visitas'
export interface ApiModelDetailResponse extends ApiPack {
  visitas?: object;
}

// Interface for the API response for the list of PPV items from /api/ppv
export interface ApiPpvListResponse {
  current_page: number;
  data: ApiPpvItem[];
  // ... other pagination fields
}
