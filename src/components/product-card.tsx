
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
import { Eye, Film } from 'lucide-react'; // Added Film icon for streaming

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const Icon = product.productType === 'streaming' ? Film : Eye;

  return (
    <Link href={`/products/detail?id=${product.id}`} passHref legacyBehavior>
      <a className="block group">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
          <CardHeader className="p-0">
            <div className="aspect-video relative w-full overflow-hidden bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={`${product.category} ${product.productType}`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400.png?text=Image+Not+Found';
                    e.currentTarget.srcset = '';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
              {product.productType === 'streaming' && (
                <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground p-1.5 rounded-full shadow-md">
                  <Film className="h-4 w-4" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
              {product.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2"> {/* Use line-clamp-2 for description */}
              {product.description}
            </CardDescription>
             <CardDescription className="text-xs text-muted-foreground mt-1 capitalize">
              Category: {product.category}
            </CardDescription>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button variant="outline" size="sm" className="w-full" aria-label={`View details for ${product.title}`}>
              <Icon className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
