import { useState } from "react";
import { type InstagramAccount } from "@/types/instagram/instagramTypes";
import { InstagramAccountDropdown } from "@/components/Instagram/InstagramAccountDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { ReelsTable } from "@/components/Instagram/ReelsTable";
import { PostsTable } from "@/components/Instagram/PostsTable";
// import { StoriesTable } from "./StoriesTable";
// import { FollowersChart } from "./FollowersChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { DateRangePicker } from "@/components/DateRangePicker";

export const InstagramPage = () => {
  // Estado para cuenta seleccionada
  const [account, setAccount] = useState<InstagramAccount>("montella");
  const { role } = useAuth();

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [from, setFrom] = useState(firstDayOfMonth.toISOString().substring(0, 10));
  const [to, setTo] = useState(today.toISOString().substring(0, 10));

  // Control para mostrar loading en sincronización
  const [syncing, setSyncing] = useState(false);

  // Handler genérico de sincronización (por ahora solo muestra un toast)
  const handleSync = async (tipo: "reels" | "posts" | "stories") => {
    setSyncing(true);
    try {
      // Aquí deberías llamar al servicio real según el tipo
      // await syncReels(account, from, to); // por ejemplo
      toast.info(`Sincronizando ${tipo} para ${account}...`);
      // await algo...
      // toast.success("Sincronización exitosa!");
    } catch (e: any) {
      toast.error(e?.message || "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  // Helper para saber si tiene permisos de sync
  const puedeSync = role === "admin" || role === "superadmin";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-8">
      {/* Encabezado y selección de cuenta */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-violet-700">Instagram</h1>
        <InstagramAccountDropdown value={account} onChange={setAccount} disabled={syncing} />
        <span className="text-gray-500 ml-4">({account.charAt(0).toUpperCase() + account.slice(1)})</span>
      </div>

      {/* Placeholder de sincronización (un botón por tipo de submódulo) */}
      {puedeSync && (
        <div className="flex gap-4">
          <Button variant="secondary" disabled={syncing} onClick={() => handleSync("reels")}>
            Sincronizar Reels
          </Button>
          <Button variant="secondary" disabled={syncing} onClick={() => handleSync("posts")}>
            Sincronizar Posteos
          </Button>
          <Button variant="secondary" disabled={syncing} onClick={() => handleSync("stories")}>
            Sincronizar Historias
          </Button>
        </div>
      )}

      <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />

      {/* Estructura visual base: cards para cada submódulo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="py-6">
            <h2 className="font-semibold text-xl mb-2">Top Reels</h2>
            <ReelsTable account={account} from={from} to={to} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <h2 className="font-semibold text-xl mb-2">Top Posteos</h2>
            <PostsTable account={account} from={from} to={to}/>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <h2 className="font-semibold text-xl mb-2">Top Historias</h2>
            {/* <StoriesTable account={account} /> */}
            <span className="text-gray-400">Tabla de historias aquí...</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <h2 className="font-semibold text-xl mb-2">Seguidores</h2>
            {/* <FollowersChart account={account} /> */}
            <span className="text-gray-400">Gráfico de seguidores aquí...</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramPage;
