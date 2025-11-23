import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Check, X } from "lucide-react";

const CATEGORIAS = ["Moda", "Belleza", "Alimentos", "Servicios", "Tecnología", "Artesanías", "Otros"];

function AdminContent() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [emprendimientos, setEmprendimientos] = useState<any[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [solicitudesRes, emprendimientosRes] = await Promise.all([
      supabase.from("solicitudes").select("*").eq("status", "pendiente").order("created_at", { ascending: false }),
      supabase.from("emprendimientos").select("*").order("created_at", { ascending: false }),
    ]);

    if (solicitudesRes.data) setSolicitudes(solicitudesRes.data);
    if (emprendimientosRes.data) setEmprendimientos(emprendimientosRes.data);
    setLoading(false);
  };

  const handleReview = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setEditedData(solicitud);
  };

  const handleApprove = async (withEdits: boolean) => {
    try {
      const dataToUse = withEdits ? editedData : selectedSolicitud;

      // Create emprendimiento
      const { error: insertError } = await supabase.from("emprendimientos").insert({
        solicitud_id: selectedSolicitud.id,
        user_id: selectedSolicitud.user_id,
        nombre_emprendimiento: dataToUse.nombre_emprendimiento,
        descripcion: dataToUse.descripcion,
        categoria: dataToUse.categoria,
        instagram: dataToUse.instagram,
        whatsapp: dataToUse.whatsapp,
        sitio_web: dataToUse.sitio_web,
        logo_url: dataToUse.logo_url,
        publicado: true,
      });

      if (insertError) throw insertError;

      // Update solicitud status
      const { error: updateError } = await supabase
        .from("solicitudes")
        .update({ status: "aprobada" })
        .eq("id", selectedSolicitud.id);

      if (updateError) throw updateError;

      toast.success("Solicitud aprobada exitosamente");
      setSelectedSolicitud(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from("solicitudes")
        .update({ status: "rechazada" })
        .eq("id", selectedSolicitud.id);

      if (error) throw error;

      toast.success("Solicitud rechazada");
      setSelectedSolicitud(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleTogglePublicado = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("emprendimientos")
        .update({ publicado: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(currentStatus ? "Emprendimiento despublicado" : "Emprendimiento publicado");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12">
        <div className="container px-4">
          <h1 className="text-4xl font-bold mb-8">Panel Administrativo</h1>

          <Tabs defaultValue="solicitudes">
            <TabsList className="mb-8">
              <TabsTrigger value="solicitudes">
                Solicitudes Pendientes ({solicitudes.length})
              </TabsTrigger>
              <TabsTrigger value="aprobados">
                Emprendimientos Publicados ({emprendimientos.filter(e => e.publicado).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="solicitudes">
              {solicitudes.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">No hay solicitudes pendientes</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {solicitudes.map((solicitud) => (
                    <Card key={solicitud.id}>
                      <CardHeader>
                        <div className="aspect-square w-full overflow-hidden rounded-lg mb-4 bg-muted">
                          <img
                            src={solicitud.logo_url}
                            alt={solicitud.nombre_emprendimiento}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardTitle className="flex items-start justify-between gap-2">
                          {solicitud.nombre_emprendimiento}
                          <Badge>{solicitud.categoria}</Badge>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {solicitud.descripcion}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(solicitud.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleReview(solicitud)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Revisar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Revisar Solicitud</DialogTitle>
                              </DialogHeader>
                              {selectedSolicitud && (
                                <div className="space-y-4">
                                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                    <img
                                      src={selectedSolicitud.logo_url}
                                      alt={selectedSolicitud.nombre_emprendimiento}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input
                                      value={editedData.nombre_emprendimiento || ""}
                                      onChange={(e) =>
                                        setEditedData({ ...editedData, nombre_emprendimiento: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                      value={editedData.descripcion || ""}
                                      onChange={(e) =>
                                        setEditedData({ ...editedData, descripcion: e.target.value })
                                      }
                                      rows={4}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select
                                      value={editedData.categoria}
                                      onValueChange={(value) =>
                                        setEditedData({ ...editedData, categoria: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
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
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label>Instagram</Label>
                                      <Input
                                        value={editedData.instagram || ""}
                                        onChange={(e) =>
                                          setEditedData({ ...editedData, instagram: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>WhatsApp</Label>
                                      <Input
                                        value={editedData.whatsapp || ""}
                                        onChange={(e) =>
                                          setEditedData({ ...editedData, whatsapp: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Sitio Web</Label>
                                      <Input
                                        value={editedData.sitio_web || ""}
                                        onChange={(e) =>
                                          setEditedData({ ...editedData, sitio_web: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button onClick={() => handleApprove(true)} className="flex-1">
                                      <Check className="h-4 w-4 mr-2" />
                                      Guardar y Aprobar
                                    </Button>
                                    <Button onClick={() => handleApprove(false)} variant="outline" className="flex-1">
                                      <Check className="h-4 w-4 mr-2" />
                                      Aprobar Sin Cambios
                                    </Button>
                                  </div>
                                  <Button onClick={handleReject} variant="destructive" className="w-full">
                                    <X className="h-4 w-4 mr-2" />
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="default" onClick={() => {
                            handleReview(solicitud);
                            handleApprove(false);
                          }}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            setSelectedSolicitud(solicitud);
                            handleReject();
                          }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="aprobados">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emprendimientos.map((emp) => (
                  <Card key={emp.id}>
                    <CardHeader>
                      <div className="aspect-square w-full overflow-hidden rounded-lg mb-4 bg-muted">
                        <img
                          src={emp.logo_url}
                          alt={emp.nombre_emprendimiento}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle>{emp.nombre_emprendimiento}</CardTitle>
                        <Badge variant={emp.publicado ? "default" : "secondary"}>
                          {emp.publicado ? "Publicado" : "Oculto"}
                        </Badge>
                      </div>
                      <CardDescription>{emp.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={emp.publicado ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublicado(emp.id, emp.publicado)}
                        className="w-full"
                      >
                        {emp.publicado ? "Despublicar" : "Publicar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}