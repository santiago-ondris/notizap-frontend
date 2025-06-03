import { useEffect, useState } from "react";
import { type InstagramAccount, type ReelDto } from "@/types/instagram/instagramTypes";
import { getTopReelsByViews } from "@/services/instagram/instagramService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Eye, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";

interface Props {
  account: InstagramAccount;
  from: string;
  to: string;
}

// Helper para cortar el contenido
const truncateWords = (texto: string, num: number) => {
  if (!texto) return "";
  const palabras = texto.split(/\s+/);
  if (palabras.length <= num) return texto;
  return palabras.slice(0, num).join(" ") + " ...";
};

export const ReelsTable: React.FC<Props> = ({ account, from, to }) => {
  const [reels, setReels] = useState<ReelDto[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setReels(null);
    getTopReelsByViews(account, from, to)
      .then((data) => {
        if (mounted) setReels(data.slice(0, 5)); // solo top 5
      })
      .catch(() => {
        toast.error("Error cargando reels");
        setReels([]);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false };
  }, [account, from, to]);

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reel</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center"><Eye size={16} className="inline" /> Vistas</TableHead>
            <TableHead className="text-center"><Heart size={16} className="inline" /> Likes</TableHead>
            <TableHead className="text-center">Instagram</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="w-32 h-4" /></TableCell>
              <TableCell><Skeleton className="w-24 h-4" /></TableCell>
              <TableCell><Skeleton className="w-10 h-4" /></TableCell>
              <TableCell><Skeleton className="w-10 h-4" /></TableCell>
              <TableCell><Skeleton className="w-10 h-4" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!reels || reels.length === 0) {
    return <span className="text-gray-500">No hay reels disponibles.</span>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contenido</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-center"><Eye size={16} className="inline" /> Vistas</TableHead>
          <TableHead className="text-center"><Heart size={16} className="inline" /> Likes</TableHead>
          <TableHead className="text-center">Instagram</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reels.map((reel) => (
          <TableRow key={reel.id}>
            <TableCell className="max-w-xs truncate" title={reel.contenido}>
              {truncateWords(reel.contenido, 10)}
            </TableCell>
            <TableCell>{format(new Date(reel.fechaPublicacion), "dd/MM/yyyy")}</TableCell>
            <TableCell className="text-center font-semibold">{reel.views?.toLocaleString("es-AR")}</TableCell>
            <TableCell className="text-center">{reel.likes?.toLocaleString("es-AR")}</TableCell>
            <TableCell className="text-center">
              <a
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline flex items-center justify-center gap-1"
                title="Ver en Instagram"
              >
                <ExternalLink size={16} />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
