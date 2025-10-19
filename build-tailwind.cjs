#!/usr/bin/env node
// Small wrapper to invoke Tailwind programmatically so we don't rely on a bin in node_modules/.bin
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
let input = './src/input.css';
let output = './dist/output.css';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-i' && args[i+1]) { input = args[i+1]; i++; }
  if (args[i] === '-o' && args[i+1]) { output = args[i+1]; i++; }
}

try {
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');
  const tailwindPostcss = require('@tailwindcss/postcss');

  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);
  const css = fs.readFileSync(inputPath, 'utf8');

  postcss([tailwindPostcss(), autoprefixer])
    .process(css, { from: inputPath, to: outputPath })
    .then(result => {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, result.css, 'utf8');
      if (result.map) fs.writeFileSync(outputPath + '.map', result.map.toString());
      console.log('Wrote', outputPath);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} catch (err) {
  console.error('Failed to run build script. Make sure dependencies are installed.', err.message || err);
  process.exit(1);
}
