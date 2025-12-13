#!/usr/bin/env node
// sync-redirects.js
// Encuentra archivos de producto que quedaron fuera de sus carpetas canónicas,
// mueve los que faltan y crea páginas de redirect en su lugar.
// Uso:
//   node sync-redirects.js         # dry-run
//   node sync-redirects.js --apply # aplica los cambios

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const THREADS = path.join(ROOT, 'threads_h');

const rules = [
  { regex: /^hoodie-.*\.html$/i, targetDir: path.join(THREADS, 'hoodies') },
  { regex: /^camiseta-.*\.html$/i, targetDir: path.join(THREADS, 'camisetas') },
  { regex: /^pantalon-.*\.html$/i, targetDir: path.join(THREADS, 'pantalones') },
  // additional rules may be added here
];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

function readDirFiles(dir){
  try{return fs.readdirSync(dir,{withFileTypes:true}).map(d=>d.name)}catch(e){return []}
}

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function makeRedirectHtml(relTarget){
  // relTarget should be relative from the redirect file's location
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${relTarget}"><title>Redirigiendo…</title></head><body>La página se movió. Si no eres redirigido, <a href="${relTarget}">haz clic aquí</a>.</body></html>`;
}

function run(){
  console.log((APPLY? 'APPLY MODE: changes will be made' : 'DRY RUN: no changes will be made. Use --apply to apply'));
  const entries = readDirFiles(THREADS);
  const files = entries.filter(e=>e.toLowerCase().endsWith('.html'));

  const actions = [];

  files.forEach(f=>{
    rules.forEach(rule => {
      if(rule.regex.test(f)){
        const source = path.join(THREADS, f);
        const target = path.join(rule.targetDir, f);
        if(!fs.existsSync(rule.targetDir)){
          actions.push({type:'mkdir', dir: rule.targetDir});
        }
        if(!fs.existsSync(target)){
          actions.push({type:'move', from: source, to: target});
          actions.push({type:'redirect', path: source, targetRel: path.relative(path.dirname(source), target).replace(/\\/g,'/')});
        } else {
          // target exists; replace source with redirect only
          actions.push({type:'redirect-only', path: source, targetRel: path.relative(path.dirname(source), target).replace(/\\/g,'/')});
        }
      }
    });
  });

  if(!actions.length){ console.log('No se encontraron archivos que mover ni redirecciones necesarias.'); return }

  console.log('Plan de acciones:');
  actions.forEach(a=>console.log(' -', a.type, a.from? a.from : a.dir? a.dir : a.path || '', a.to? '-> '+a.to : a.targetRel? '-> '+a.targetRel : ''));

  if(!APPLY){ console.log('\nEjecuta con `--apply` para aplicar estos cambios.'); return }

  // execute
  actions.forEach(a=>{
    try{
      if(a.type==='mkdir'){
        ensureDir(a.dir);
        console.log('mkdir', a.dir);
      } else if(a.type==='move'){
        ensureDir(path.dirname(a.to));
        fs.renameSync(a.from, a.to);
        console.log('moved', a.from, '->', a.to);
      } else if(a.type==='redirect' || a.type==='redirect-only'){
        const html = makeRedirectHtml(a.targetRel);
        fs.writeFileSync(a.path, html, 'utf8');
        console.log('wrote redirect', a.path, '->', a.targetRel);
      }
    }catch(err){ console.error('Error applying action', a, err.message) }
  });

  console.log('\nAcciones completadas. Revisa los archivos y haz commit si todo está correcto.');
}

if(require.main === module) run();
