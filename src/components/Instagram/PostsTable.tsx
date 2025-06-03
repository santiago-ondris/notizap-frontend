import { useEffect, useState } from "react";
import { type InstagramAccount, type PostDto } from "@/types/instagram/instagramTypes";
import { getTopPosts } from "@/services/instagram/instagramService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";

interface Props {
  account: InstagramAccount;
  from: string;
  to: string;
  ordenarPor?: string; // likes | comments | engagement, etc.
}

// Helper para truncar el contenido a X palabras
const truncateWords = (texto: string, num: number) => {
  if (!texto) return "";
  const palabras = texto.split(/\s+/);
  if (palabras.length <= num) return texto;
  return palabras.slice(0, num).join(" ") + " ...";
};

export const PostsTable: React.FC<Props> = ({
  account,
  from,
  to,
  ordenarPor = "likes"
}) => {
  const [posts, setPosts] = useState<PostDto[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPosts(null);
    getTopPosts(account, from, to, ordenarPor)
      .then((data) => {
        if (mounted) setPosts(data.slice(0, 5));
      })
      .catch(() => {
        toast.error("Error cargando posteos");
        setPosts([]);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false };
  }, [account, from, to, ordenarPor]);

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contenido</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center"><Heart size={16} className="inline" /> Likes</TableHead>
            <TableHead className="text-center"><MessageCircle size={16} className="inline" /> Comentarios</TableHead>
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

  if (!posts || posts.length === 0) {
    return <span className="text-gray-500">No hay posteos disponibles.</span>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contenido</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-center"><Heart size={16} className="inline" /> Likes</TableHead>
          <TableHead className="text-center"><MessageCircle size={16} className="inline" /> Comentarios</TableHead>
          <TableHead className="text-center">Instagram</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="max-w-xs truncate" title={post.content}>
              {truncateWords(post.content, 10)}
            </TableCell>
            <TableCell>{format(new Date(post.fechaPublicacion), "dd/MM/yyyy")}</TableCell>
            <TableCell className="text-center">{post.likes?.toLocaleString("es-AR")}</TableCell>
            <TableCell className="text-center">{post.comments?.toLocaleString("es-AR")}</TableCell>
            <TableCell className="text-center">
              <a
                href={post.url}
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
