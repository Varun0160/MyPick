import { createReadStream } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const { id } = req.query;
  const imagePath = join(process.cwd(), 'public', 'images', `${id}.jpg`);

  const imageStream = createReadStream(imagePath);
  imageStream.on('error', (error) => {
    console.error('Error reading image:', error);
    res.status(404).json({ error: 'Image not found' });
  });

  res.setHeader('Content-Type', 'image/jpeg');
  imageStream.pipe(res);
}
