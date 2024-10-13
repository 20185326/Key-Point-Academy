import express from 'express';
import multer from 'multer';
import JSZip from 'jszip';
import Jimp from 'jimp';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

const algoritmoClasificador = async (imageBuffer) => {
  const image = await Jimp.read(imageBuffer);
  let brightness = 0;
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const red = image.bitmap.data[idx + 0];
    const green = image.bitmap.data[idx + 1];
    const blue = image.bitmap.data[idx + 2];
    brightness += (red + green + blue) / 3;
  });
  const averageBrightness = brightness / (image.bitmap.width * image.bitmap.height);
  return averageBrightness > 128 ? 'clara' : 'oscura';
};

app.post('/process-zip', upload.single('zipFile'), async (req, res) => {
  try {
    const zipBuffer = await fs.readFile(req.file.path);
    const zip = await JSZip.loadAsync(zipBuffer);
    
    const processedImages = {
      claras: new JSZip(),
      oscuras: new JSZip()
    };

    for (const [fileName, file] of Object.entries(zip.files)) {
      if (file.dir) continue;
      
      const imageBuffer = await file.async('nodebuffer');
      const classification = await algoritmoClasificador(imageBuffer);
      
      processedImages[classification].file(fileName, imageBuffer);
    }

    const outputZip = new JSZip();
    outputZip.file('claras.zip', await processedImages.claras.generateAsync({type: 'nodebuffer'}));
    outputZip.file('oscuras.zip', await processedImages.oscuras.generateAsync({type: 'nodebuffer'}));

    const outputBuffer = await outputZip.generateAsync({type: 'nodebuffer'});
    
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=processed_images.zip');
    res.send(outputBuffer);

    // Limpiar el archivo temporal
    await fs.unlink(req.file.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el archivo ZIP' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});