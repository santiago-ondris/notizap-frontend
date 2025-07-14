export const copiarAlPortapapeles = async (texto: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (error) {
      // Fallback para navegadores más antiguos
      try {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (fallbackError) {
        console.error('No se pudo copiar al portapapeles:', fallbackError);
        return false;
      }
    }
  };