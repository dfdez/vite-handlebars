import fs from 'fs';
import path from 'path';

function writeHandlebarsFile(handlebars, { src, data, destination }) {
  const destinationPath = path.resolve(destination);

  const dirname = path.dirname(destinationPath);
  fs.mkdirSync(dirname, { recursive: true });

  const result = handlebars.compile(src)(data);
  fs.writeFileSync(destinationPath, result);
}

function handleOutDir(instance, { src }) {
  const { handlebars, data, outDir, compile } = instance;

  fs.existsSync(outDir) && fs.rmdirSync(outDir, { recursive: true });

  for (const filePath in compile) {
    const fileData = compile[filePath];
    writeHandlebarsFile(handlebars, {
      src,
      data: { ...data, ...fileData },
      destination: `${outDir}/${filePath}`
    });
  }
}

export const emitFiles = [];

function handleEmit(instance, { src }) {
  const { handlebars, data, compile } = instance;

  for (const filePath in compile) {
    const fileData = compile[filePath];
    emitFiles.push({
      type: 'asset',
      fileName: filePath,
      source: handlebars.compile(src)({ ...data, ...fileData })
    });
  }
}

export function compile(instance, { emit } = {}) {
  const { outDir, compile, path } = instance;

  if (!compile) return;

  const src = fs.readFileSync(path).toString();
  if (outDir) {
    handleOutDir(instance, { src });
  } else if (emit) {
    handleEmit(instance, { src });
  }
}

export default {
  emitFiles,
  compile
};