import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
export async function saveUploadedFile(file: File, subDir = 'images'): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || '.png';
  const filename = uuidv4() + ext;
  const dir = path.join(UPLOAD_DIR, subDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return '/uploads/' + subDir + '/' + filename;
}
