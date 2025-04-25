import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InspirationItem {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
}

export function InspirationSection() {
  // Wedding inspiration images
  const inspirationItems: InspirationItem[] = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Spring Floral Arrangements",
      description: "Soft pinks and whites for table centerpieces"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Garden Ceremony Setup",
      description: "Outdoor ceremony with floral arch"
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Table Setting Ideas",
      description: "Elegant place settings with gold accents"
    },
    {
      id: 4,
      imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Wedding Cake Designs",
      description: "Modern minimalist cakes with floral touches"
    },
    {
      id: 5,
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Bridesmaid Bouquets",
      description: "Complementary bouquets for the bridal party"
    },
    {
      id: 6,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Reception Lighting",
      description: "String lights and candles for a romantic atmosphere"
    },
    {
      id: 7,
      imageUrl: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Venue Decorations",
      description: "Elegant drapery and floral installations"
    },
    {
      id: 8,
      imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
      title: "Wedding Invitations",
      description: "Handcrafted paper goods with personalized details"
    }
  ];
  
  const [displayCount, setDisplayCount] = useState(4);
  
  const showMore = () => {
    setDisplayCount(Math.min(displayCount + 4, inspirationItems.length));
  };
  
  const showLess = () => {
    setDisplayCount(4);
  };
  
  return (
    <section className="mt-10">
      <h3 className="font-heading text-2xl mb-6">Wedding Inspiration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {inspirationItems.slice(0, displayCount).map((item) => (
          <Card key={item.id} className="overflow-hidden shadow-sm">
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4 bg-white">
              <h4 className="font-body font-medium">{item.title}</h4>
              <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center mt-6">
        {displayCount < inspirationItems.length ? (
          <Button 
            variant="outline" 
            className="inline-block bg-white text-primary-foreground hover:text-primary border border-primary"
            onClick={showMore}
          >
            Browse more inspiration
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="inline-block bg-white text-primary-foreground hover:text-primary border border-primary"
            onClick={showLess}
          >
            Show less
          </Button>
        )}
      </div>
    </section>
  );
}
