import fs from 'fs';
import path from 'path';

const readTemplate = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`[vite-plugin-hbs] Failed to read template "${filePath}": ${err.message}`);
  }
};

const writeHandlebarsFile = (handlebars, { src, data, destination }) => {
  const destinationPath = path.resolve(destination);
  const dirname = path.dirname(destinationPath);

  try {
    fs.mkdirSync(dirname, { recursive: true });
  } catch (err) {
    throw new Error(`[vite-plugin-hbs] Failed to create directory "${dirname}": ${err.message}`);
  }

  let result;
  try {
    result = handlebars.compile(src)(data);
  } catch (err) {
    throw new Error(
      `[vite-plugin-hbs] Failed to compile template for "${destination}": ${err.message}`
    );
  }

  try {
    fs.writeFileSync(destinationPath, result);
  } catch (err) {
    throw new Error(`[vite-plugin-hbs] Failed to write file "${destinationPath}": ${err.message}`);
  }
};

const handleOutDir = (instance, { src }) => {
  const { handlebars, data, outDir, compile } = instance;

  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  for (const filePath in compile) {
    const fileData = compile[filePath];
    writeHandlebarsFile(handlebars, {
      src,
      data: { ...data, ...fileData },
      destination: `${outDir}/${filePath}`,
    });
  }
};

export const emitFiles = [];

const handleEmit = (instance, { src }) => {
  const { handlebars, data, compile } = instance;

  for (const filePath in compile) {
    const fileData = compile[filePath];
    let source;
    try {
      source = handlebars.compile(src)({ ...data, ...fileData });
    } catch (err) {
      throw new Error(
        `[vite-plugin-hbs] Failed to compile template for emitted file "${filePath}": ${err.message}`
      );
    }
    emitFiles.push({
      type: 'asset',
      fileName: filePath,
      source,
    });
  }
};

export const compile = (instance, { emit } = {}) => {
  const { outDir, compile, path } = instance;

  if (!compile) return;

  const src = readTemplate(path);

  if (outDir) {
    handleOutDir(instance, { src });
  } else if (emit) {
    handleEmit(instance, { src });
  }
};

export default {
  emitFiles,
  compile,
};
