import { Instagram, Globe, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BusinessCardProps {
  nombre: string;
  descripcion: string;
  categoria: string;
  logoUrl: string;
  instagram?: string | null;
  whatsapp?: string | null;
  sitioWeb?: string | null;
}

export const BusinessCard = ({
  nombre,
  descripcion,
  categoria,
  logoUrl,
  instagram,
  whatsapp,
  sitioWeb,
}: BusinessCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="aspect-square w-full overflow-hidden rounded-lg mb-4 bg-muted">
          <img
            src={logoUrl}
            alt={`Logo de ${nombre}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{nombre}</CardTitle>
          <Badge variant="secondary">{categoria}</Badge>
        </div>
        <CardDescription className="line-clamp-3">{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2 flex-wrap">
          {instagram && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`https://instagram.com/${instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </a>
            </Button>
          )}
          {whatsapp && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          )}
          {sitioWeb && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={sitioWeb} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Sitio Web
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};