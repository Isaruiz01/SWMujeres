import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Upload } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CATEGORIAS = ["Moda", "Belleza", "Alimentos", "Servicios", "Tecnología", "Artesanías", "Otros"];

function SolicitudContent() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasPendingSolicitud, setHasPendingSolicitud] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingSolicitud = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("solicitudes")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pendiente")
        .single();

      if (data) {
        setHasPendingSolicitud(true);
      }
    };

    checkExistingSolicitud();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es muy grande. Máximo 5MB.");
        return;
      }
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logo) {
      toast.error("Debes subir un logo");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      // Upload logo
      const fileExt = logo.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("logos")
        .upload(fileName, logo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      // Create solicitud
      const { error: insertError } = await supabase.from("solicitudes").insert({
        user_id: user.id,
        nombre_emprendimiento: nombre,
        descripcion,
        categoria,
        instagram: instagram || null,
        whatsapp: whatsapp || null,
        sitio_web: sitioWeb || null,
        logo_url: publicUrl,
      });

      if (insertError) throw insertError;

      toast.success("¡Solicitud enviada! Está en revisión.");
      navigate("/directorio");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (hasPendingSolicitud) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
          <Card className="max-w-md shadow-soft">
            <CardHeader>
              <CardTitle>Solicitud Pendiente</CardTitle>
              <CardDescription>
                Ya tienes una solicitud en revisión. Te notificaremos cuando sea aprobada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/directorio")} className="w-full">
                Ver Directorio
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-3xl">Registra tu Emprendimiento</CardTitle>
              <CardDescription>
                Completa el formulario para que tu emprendimiento aparezca en nuestro directorio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Emprendimiento *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">
                    Descripción * ({descripcion.length}/300)
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={300}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select value={categoria} onValueChange={setCategoria} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+56912345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitioWeb">Sitio Web (opcional)</Label>
                  <Input
                    id="sitioWeb"
                    type="url"
                    value={sitioWeb}
                    onChange={(e) => setSitioWeb(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo/Foto * (máx 5MB)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                      required
                    />
                    {logoPreview && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border">
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Solicitud() {
  return (
    <ProtectedRoute>
      <SolicitudContent />
    </ProtectedRoute>
  );
}