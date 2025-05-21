
import type { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react'; // Changed icon to something more generic

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} passHref legacyBehavior>
      <a className="block group">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
          <CardHeader className="p-0">
            <div className="aspect-video relative w-full overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={`${product.category} ${product.productType}`}
                  onError={(e) => {
                    // Fallback for broken images, or hide them
                    e.currentTarget.src = 'https://placehold.co/600x400.png?text=Image+Not+Found';
                    e.currentTarget.srcset = '';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
              {product.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-3"> {/* Increased line-clamp for tags */}
              {product.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button variant="outline" size="sm" className="w-full" aria-label={`View details for ${product.title}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
