
import type { LucideIcon } from 'lucide-react';

// Updated to match the API structure from test.onlysfree.com
export interface Product {
  id: string; // from API's id (number), converted to string
  title: string; // from API's 'nombre'
  description: string; // from API's 'tags' or a placeholder
  imageUrl: string; // from API's 'imagen'
  category: string; // from API's 'tags' (or part of it)
  productType: 'standard' | 'streaming'; // Determined by 'isVideo' or 'url_video'
  videoUrl?: string; // from API's 'url_video'
  hotLink?: string; // from API's 'hotLink', used for actual content link
  // Price is removed as it's not in the API
}

export interface SaleCategory {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}

// Interface for the API response for the list of packs
export interface ApiPack {
  id: number;
  nombre: string;
  imagen: string;
  NombreLink: string;
  hotLink: string;
  isVideo: string; // "0", "1", or ""
  url_video: string;
  tags: string;
}

export interface ApiPackListResponse {
  current_page: number;
  data: ApiPack[];
  // ... other pagination fields if needed
}

// Interface for the API response for a single model/pack detail
export interface ApiModelDetailResponse extends ApiPack {
  // Potentially more fields here if the detail endpoint returns more
  visitas?: object; // Example, based on your sample
}
