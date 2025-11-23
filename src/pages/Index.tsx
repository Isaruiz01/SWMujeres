import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/Navbar";
import { BusinessCard } from "@/components/BusinessCard";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Users, TrendingUp, Heart, Target, Award } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export default function Index() {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedBusinesses();
  }, []);

  const fetchFeaturedBusinesses = async () => {
    const { data } = await supabase
      .from("emprendimientos")
      .select("*")
      .eq("publicado", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setFeaturedBusinesses(data);
    }
  };

  const benefits = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Mayor Visibilidad",
      description: "Tu emprendimiento visible para miles de personas interesadas en apoyar negocios locales.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Networking",
      description: "Conecta con otras emprendedoras, comparte experiencias y crea colaboraciones valiosas.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Crecimiento",
      description: "Accede a recursos, consejos y oportunidades para hacer crecer tu negocio.",
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Apoyo Mutuo",
      description: "Forma parte de una comunidad que se apoya mutuamente y celebra cada logro.",
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Alcance Directo",
      description: "Llega directamente a tu audiencia ideal con enlaces a tus redes sociales y sitio web.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Reconocimiento",
      description: "Posiciónate como referente en tu categoría y construye tu marca profesional.",
    },
  ];

  const faqs = [
    {
      question: "¿Cómo me uno a SW Mujeres?",
      answer: "Es muy simple. Solo regístrate en nuestra plataforma, completa el formulario de solicitud con los datos de tu emprendimiento y espera la aprobación. ¡En pocos días estarás visible en nuestro directorio!",
    },
    {
      question: "¿Tiene algún costo registrarse?",
      answer: "No, el registro y la publicación en nuestro directorio son completamente gratuitos. Creemos en apoyar a las emprendedoras sin barreras económicas.",
    },
    {
      question: "¿Qué tipo de emprendimientos pueden unirse?",
      answer: "Aceptamos todo tipo de emprendimientos liderados por mujeres: moda, belleza, alimentos, servicios, tecnología, artesanías y más. Si es tu proyecto y lo lideras con pasión, ¡eres bienvenida!",
    },
    {
      question: "¿Cuánto demora la aprobación?",
      answer: "Revisamos las solicitudes regularmente. En la mayoría de los casos, tu emprendimiento será aprobado y publicado en 24-48 horas.",
    },
    {
      question: "¿Puedo editar mi información después?",
      answer: "Sí, puedes contactarnos en cualquier momento para actualizar la información de tu emprendimiento. Queremos que tu perfil siempre esté actualizado.",
    },
    {
      question: "¿Cómo ayuda el directorio a mi negocio?",
      answer: "El directorio te da visibilidad ante una audiencia interesada específicamente en apoyar emprendimientos de mujeres. Además, facilita que tus clientes potenciales te encuentren y contacten directamente.",
    },
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
        </div>
        <div className="relative z-10 container px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              SW Mujeres
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            La comunidad que conecta y empodera emprendimientos de mujeres
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="text-lg">
              <Link to="/registro">Registrar mi Emprendimiento</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link to="/directorio">Explorar Directorio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Sobre la Comunidad</h2>
            <p className="text-lg text-muted-foreground mb-4">
              SW Mujeres es un directorio diseñado para visibilizar y conectar emprendimientos liderados por mujeres. 
              Creemos en el poder de la colaboración y en crear un espacio donde cada emprendedora pueda brillar.
            </p>
            <p className="text-lg text-muted-foreground">
              Nuestra misión es eliminar barreras y construir puentes entre emprendedoras y sus clientes, 
              fomentando una economía más inclusiva y equitativa.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Beneficios de Unirte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <div className="mb-4">{benefit.icon}</div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Conoce Nuestros Emprendimientos
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Descubre algunos de los increíbles negocios que forman parte de nuestra comunidad
          </p>
          
          {featuredBusinesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    nombre={business.nombre_emprendimiento}
                    descripcion={business.descripcion}
                    categoria={business.categoria}
                    logoUrl={business.logo_url}
                    instagram={business.instagram}
                    whatsapp={business.whatsapp}
                    sitioWeb={business.sitio_web}
                  />
                ))}
              </div>
              <div className="text-center">
                <Button asChild size="lg" className="text-lg">
                  <Link to="/directorio">Ver Todos los Emprendimientos</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                Próximamente verás aquí emprendimientos increíbles. ¡Sé una de las primeras!
              </p>
              <Button asChild>
                <Link to="/registro">Registrar mi Emprendimiento</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t">
        <div className="container px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SW Mujeres
            </h3>
            <p className="text-muted-foreground mb-6">
              Empoderando emprendimientos, construyendo comunidad
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <Link to="/directorio" className="text-muted-foreground hover:text-primary transition-colors">
                Directorio
              </Link>
              <Link to="/registro" className="text-muted-foreground hover:text-primary transition-colors">
                Registrarse
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SW Mujeres. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}