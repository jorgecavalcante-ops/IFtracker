#!/usr/bin/env node

/**
 * 🔍 Verificação de Prontidão do Projeto
 * Verifica se tudo está pronto antes de copiar PDFs
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║  🔍 VERIFICAÇÃO DE PRONTIDÃO DO PROJETO           ║');
console.log('╚════════════════════════════════════════════════════╝\n');

const checks = [];

// Check 1: data.js exists and is updated
console.log('1️⃣  Verificando data.js...');
const dataJsPath = path.join(__dirname, 'src', 'data.js');
if (fs.existsSync(dataJsPath)) {
  const content = fs.readFileSync(dataJsPath, 'utf8');
  const hasUpdatedPaths = content.includes('pdfs/POP_AGITADOR_MAGNETICO_COM_AQUECIMENTO.pdf');
  if (hasUpdatedPaths) {
    console.log('   ✅ data.js existe e contém caminhos atualizados');
    checks.push(true);
  } else {
    console.log('   ⚠️  data.js existe mas caminhos podem não estar atualizados');
    checks.push(false);
  }
} else {
  console.log('   ❌ data.js não encontrado!');
  checks.push(false);
}

// Check 2: equipment.js exists
console.log('\n2️⃣  Verificando equipment.js...');
const equipmentJsPath = path.join(__dirname, 'src', 'equipment.js');
if (fs.existsSync(equipmentJsPath)) {
  const content = fs.readFileSync(equipmentJsPath, 'utf8');
  const hasPdfLoad = content.includes('pdfjsLib.getDocument');
  if (hasPdfLoad) {
    console.log('   ✅ equipment.js existe e tem visualizador PDF');
    checks.push(true);
  } else {
    console.log('   ⚠️  equipment.js pode não ter visualizador PDF');
    checks.push(false);
  }
} else {
  console.log('   ❌ equipment.js não encontrado!');
  checks.push(false);
}

// Check 3: Scripts exist
console.log('\n3️⃣  Verificando scripts de cópia...');
const scripts = ['copy_pdfs.bat', 'copy_pdfs.js', 'copy_pdfs.py'];
let scriptsFound = 0;
scripts.forEach(script => {
  if (fs.existsSync(path.join(__dirname, script))) {
    console.log(`   ✅ ${script}`);
    scriptsFound++;
  } else {
    console.log(`   ❌ ${script} não encontrado`);
  }
});
checks.push(scriptsFound === 3);

// Check 4: Documentation exists
console.log('\n4️⃣  Verificando documentação...');
const docs = [
  'PDF_SETUP_INSTRUCTIONS.md',
  'QUICK_START.md',
  'CHANGES_SUMMARY.md',
  'PROJECT_STATUS.md',
  'PDF_INDEXING_CHECKLIST.txt'
];
let docsFound = 0;
docs.forEach(doc => {
  if (fs.existsSync(path.join(__dirname, doc))) {
    console.log(`   ✅ ${doc}`);
    docsFound++;
  } else {
    console.log(`   ⚠️  ${doc} não encontrado`);
  }
});
checks.push(docsFound >= 3);

// Check 5: Source PDFs exist
console.log('\n5️⃣  Verificando PDFs de origem...');
const sources = [
  'C:\\Users\\Jorge\\Downloads\\POPs_Microscopia',
  'C:\\Users\\Jorge\\Downloads\\POPs_Lavagem',
  'C:\\Users\\Jorge\\Downloads\\POPs_Analises_Clinicas',
  'C:\\Users\\Jorge\\Downloads\\multididatico_POP'
];
let pdfCount = 0;
sources.forEach(source => {
  if (fs.existsSync(source)) {
    const files = fs.readdirSync(source).filter(f => f.endsWith('.pdf'));
    console.log(`   ✅ ${source.split('\\').pop()}: ${files.length} PDFs`);
    pdfCount += files.length;
  } else {
    console.log(`   ❌ ${source} não encontrado`);
  }
});
checks.push(pdfCount >= 35);

// Check 6: pdfs folder
console.log('\n6️⃣  Verificando pasta pdfs...');
const pdfsFolderPath = path.join(__dirname, 'pdfs');
if (fs.existsSync(pdfsFolderPath)) {
  const pdfFiles = fs.readdirSync(pdfsFolderPath).filter(f => f.endsWith('.pdf'));
  console.log(`   ⚠️  Pasta pdfs existe com ${pdfFiles.length} arquivos`);
  console.log(`       (será sobrescrita ao executar copy script)`);
  checks.push(true);
} else {
  console.log('   ℹ️  Pasta pdfs não existe (será criada automaticamente)');
  checks.push(true);
}

// Check 7: package.json has dependencies
console.log('\n7️⃣  Verificando dependências...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies['pdfjs-dist']) {
    console.log('   ✅ pdfjs-dist instalado');
    checks.push(true);
  } else {
    console.log('   ⚠️  pdfjs-dist pode não estar instalado (execute: npm install)');
    checks.push(false);
  }
} else {
  console.log('   ❌ package.json não encontrado!');
  checks.push(false);
}

// Summary
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║              📊 RESUMO DE VERIFICAÇÃO               ║');
console.log('╚════════════════════════════════════════════════════╝\n');

const passedChecks = checks.filter(c => c).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`✅ Verificações Passou: ${passedChecks}/${totalChecks}`);
console.log(`📈 Percentual: ${percentage}%`);

if (percentage === 100) {
  console.log('\n🎉 TUDO PRONTO! Você pode executar o script de cópia.\n');
  console.log('Próximo passo:');
  console.log('  → copy_pdfs.bat\n');
} else if (percentage >= 80) {
  console.log('\n⚠️  Quase pronto! Alguns itens podem precisar atenção.\n');
  console.log('Recomendações:');
  console.log('  1. Verifique o npm install se necessário');
  console.log('  2. Confirme os caminhos das pastas de PDF\n');
} else {
  console.log('\n❌ Há problemas que precisam ser resolvidos primeiro.\n');
}

console.log('═══════════════════════════════════════════════════════\n');
