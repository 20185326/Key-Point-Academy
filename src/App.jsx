import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import JSZip from 'jszip';
import { Upload, Download } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFileUpload = async (event, grade) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    try {
      const zip = new JSZip();
      zip.file(fileName, file);

      const images = ['1.png', '2.png', '3.png'];
      for (const imageName of images) {
        const imageResponse = await fetch(`/uploads/${grade}/${imageName}`);
        if (!imageResponse.ok) {
          throw new Error(`Error al obtener la imagen ${imageName}`);
        }
        const imageBlob = await imageResponse.blob();
        zip.file(imageName, imageBlob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Zip = reader.result.split(',')[1];

          const response = await fetch(
            'https://fcz3yiiezk.execute-api.us-east-1.amazonaws.com/Centrum/Test',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                authorizationToken: 'allow',
              },
              body: JSON.stringify({ zipFile: base64Zip, grado: grade }),
            }
          );

          if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
          }

          const data = await response.json();
          setDownloadUrl(data.downloadUrl);
        } catch (err) {
          console.error('Error:', err);
          setError('Error al procesar el archivo ZIP en el servidor');
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(zipBlob);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al procesar el archivo CSV y las imágenes');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      // Reiniciar el estado después de la descarga
      setDownloadUrl(null);
      setError(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f0f0f0',
        padding: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          <img
            src="/uploads/imgs/KeyPointIcon.png"
            alt="Key Point Academy Logo"
            width={200}
            height={60}
          />
        </Box>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Generador de Libretas Escolares
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Sube un archivo Excel/CSV con la información de los alumnos y obtén un ZIP con sus
          libretas escolares en PDF.
        </Typography>
        {['3K', '4K', '5K'].map((grade) => (
          <Box key={grade} sx={{ width: '100%', mb: 2 }}>
            <input
              accept=".csv, .xls, .xlsx"
              style={{ display: 'none' }}
              id={`raised-button-file-${grade}`}
              type="file"
              onChange={(e) => handleFileUpload(e, grade)}
            />
            <label htmlFor={`raised-button-file-${grade}`}>
              <Button
                variant="contained"
                color="success"
                component="span"
                disabled={isLoading || !!downloadUrl}
                startIcon={isLoading ? <CircularProgress size={24} /> : <Upload />}
                fullWidth
              >
                {isLoading ? 'Procesando...' : `Subir archivo Excel/CSV ${grade}`}
              </Button>
            </label>
          </Box>
        ))}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDownload}
          disabled={!downloadUrl}
          startIcon={<Download />}
          fullWidth
        >
          Descargar Libretas (ZIP)
        </Button>
      </Paper>

      {/* Modal Dialog */}
      <Dialog open={isLoading} onClose={() => {}} disableEscapeKeyDown>
        <DialogTitle>Procesando...</DialogTitle>
        <DialogContent sx={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress sx={{ mr: 2 }} />
          <DialogContentText>
            Por favor, espera mientras procesamos tu archivo.
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
