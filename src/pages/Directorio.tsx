import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { BusinessCard } from "@/components/BusinessCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

const CATEGORIAS = ["Todas", "Moda", "Belleza", "Alimentos", "Servicios", "Tecnología", "Artesanías", "Otros"];

export default function Directorio() {
  const [emprendimientos, setEmprendimientos] = useState<any[]>([]);
  const [filteredEmprendimientos, setFilteredEmprendimientos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmprendimientos();
  }, []);

  useEffect(() => {
    filterEmprendimientos();
  }, [searchTerm, selectedCategoria, emprendimientos]);

  const fetchEmprendimientos = async () => {
    const { data, error } = await supabase
      .from("emprendimientos")
      .select("*")
      .eq("publicado", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEmprendimientos(data);
    }
    setLoading(false);
  };

  const filterEmprendimientos = () => {
    let filtered = emprendimientos;

    if (selectedCategoria !== "Todas") {
      filtered = filtered.filter((emp) => emp.categoria === selectedCategoria);
    }

    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.nombre_emprendimiento.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmprendimientos(filtered);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Directorio de Emprendimientos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre y conecta con increíbles emprendimientos de mujeres
            </p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedCategoria} onValueChange={setSelectedCategoria} className="mb-12">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 h-auto">
              {CATEGORIAS.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs md:text-sm">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredEmprendimientos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No se encontraron emprendimientos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredEmprendimientos.map((emp) => (
                <BusinessCard
                  key={emp.id}
                  nombre={emp.nombre_emprendimiento}
                  descripcion={emp.descripcion}
                  categoria={emp.categoria}
                  logoUrl={emp.logo_url}
                  instagram={emp.instagram}
                  whatsapp={emp.whatsapp}
                  sitioWeb={emp.sitio_web}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}