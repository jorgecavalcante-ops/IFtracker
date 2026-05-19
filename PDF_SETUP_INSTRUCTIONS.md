# 📋 Instruções para Indexação de PDFs no Projeto

## ✅ Status Atual

### Concluído:
- ✅ Atualização de `src/data.js` com os caminhos corretos dos PDFs
- ✅ Configuração do visualizador PDF em `src/equipment.js`
- ✅ Estrutura do projeto pronta

### Próximos Passos:
- ⏳ Copiar os 38 arquivos PDF para a pasta `pdfs/`

---

## 📦 Estrutura de PDFs Identificados

### **Análises Clínicas** (17 PDFs)
- POP_AGITADOR_MAGNETICO_COM_AQUECIMENTO.pdf
- POP_AUTOCLAVE_VERTICAL.pdf
- POP_BALANCA_SEMI_ANALITICA.pdf
- POP_BANHO_MARIA.pdf
- POP_CABINE_DE_FLUXO_LAMINAR_NF4703.pdf
- POP_CAPELA_DE_FLUXO_LAMINAR_S27.pdf
- POP_CENTRIFUGA_CLINICA_DIGITAL.pdf
- POP_CENTRIFUGA_MANUAL.pdf
- POP_DESTILADOR_DE_AGUA.pdf
- POP_ESPECTROFOTOMETRO_DIGITAL.pdf
- POP_ESTUFA_DE_CULTURA_BACTERIOLOGICA.pdf
- POP_ESTUFA_DE_SECAGEM.pdf
- POP_FORNO_DE_MICROONDAS.pdf
- POP_INCUBADORA_SHAKER.pdf
- POP_SELADORA_A_VACUO.pdf
- POP_ULTRAFREEZER.pdf
- POP_ULTRAPURIFICADOR_DE_AGUA.pdf

### **Biossegurança/Lavagem** (3 PDFs)
- POP_HIGIENIZACAO_DAS_MAOS.pdf
- POP_LAVAGEM_DE_VIDRARIAS.pdf
- POP_LIMPEZA_DE_BANCADA.pdf
- POP_LAVA_OLHOS.pdf *(Este não está na pasta, mas é esperado no data.js)*

### **Microscopia** (3 PDFs)
- POP_CONTADOR_DE_CELULAS_SANGUINEAS.pdf
- POP_MICROSCOPIO_ESTEREOSCOPIO.pdf
- POP_MICROSCOPIO_OPTICO.pdf

### **Multididático** (15 PDFs)
- AGITADOR_MAGNETICO_COM_AQUECIMENTO.pdf
- BALANLCA_ANALITICA.pdf
- BANHO_ULTRASSONICO_CONJUGADO.pdf
- BANHO_ULTRATERMOSTATIZADO.pdf
- CAMERA_ESCURA_UV.pdf
- CENTRIFUGA.pdf
- DESTILADOR_DE_AGUA.pdf
- ESTUFA_DE_CULTURA_BACTERIOLOGICA.pdf
- ESTUFA_DIGITAL_ESTERILIZACAO_.pdf
- FORNO_MUFLA.pdf
- INCUBADORA_SHAKER.pdf
- MANTA_AQUECEDORA.pdf
- MICROTOMO.pdf
- SELADORA.pdf
- VISCOSIMETRO.pdf

---

## 🚀 Como Executar o Setup

### Opção 1: Usar o Script Batch (Recomendado no Windows)
```bash
C:\Users\Jorge\Downloads\iftracker\copy_pdfs.bat
```

Simplesmente **execute** o arquivo `copy_pdfs.bat` na pasta do projeto. Ele:
1. ✓ Criará a pasta `pdfs/` automaticamente
2. ✓ Copiará todos os 38 PDFs das 4 pastas de origem
3. ✓ Exibirá um relatório de confirmação

### Opção 2: Usar Node.js
```bash
cd C:\Users\Jorge\Downloads\iftracker
node copy_pdfs.js
```

### Opção 3: Usar Python 3
```bash
cd C:\Users\Jorge\Downloads\iftracker
python copy_pdfs.py
```

### Opção 4: Manual (Alternativa)
1. Crie uma pasta chamada `pdfs` na raiz do projeto: `C:\Users\Jorge\Downloads\iftracker\pdfs\`
2. Copie os arquivos PDF das 4 pastas de origem para `pdfs/`:
   - De `C:\Users\Jorge\Downloads\POPs_Microscopia\` → `pdfs/`
   - De `C:\Users\Jorge\Downloads\POPs_Lavagem\` → `pdfs/`
   - De `C:\Users\Jorge\Downloads\POPs_Analises_Clinicas\` → `pdfs/`
   - De `C:\Users\Jorge\Downloads\multididatico_POP\` → `pdfs/`

---

## 📁 Estrutura Final do Projeto

```
iftracker/
├── pdfs/                    # ← NOVA PASTA COM TODOS OS 38 PDFs
│   ├── POP_AGITADOR_*.pdf
│   ├── POP_AUTOCLAVE_*.pdf
│   ├── ... (todos os PDFs)
│   └── VISCOSIMETRO.pdf
├── src/
│   ├── data.js              # ✅ ATUALIZADO com caminhos corretos
│   ├── equipment.js         # ✅ PDF viewer configurado
│   ├── lab.js
│   ├── main.js
│   └── style.css
├── index.html
├── lab.html
├── equipment.html
├── copy_pdfs.bat            # Script de cópia
├── copy_pdfs.js
├── copy_pdfs.py
├── package.json
└── vite.config.ts
```

---

## 🔍 Verificação Pós-Setup

### 1. **Verificar a Pasta `pdfs/`**
```bash
# Contar arquivos na pasta (deve ser 38)
dir C:\Users\Jorge\Downloads\iftracker\pdfs /B *.pdf | find /C /V ""
```

### 2. **Iniciar o Servidor de Desenvolvimento**
```bash
cd C:\Users\Jorge\Downloads\iftracker
npm install    # Se necessário
npm run dev    # Inicia o servidor em http://localhost:3000
```

### 3. **Testar no Navegador**
1. Acesse: **http://localhost:3000**
2. Clique em qualquer setor (Análises Clínicas, Biossegurança, Microscopia, Multididático)
3. Selecione um equipamento
4. O visualizador de PDF deve aparecer com:
   - ✅ Exibição da primeira página
   - ✅ Botões de navegação (← →)
   - ✅ Controles de zoom (+/-)
   - ✅ Barra de pesquisa interna
   - ✅ Indicador de página (ex: 1/5)

---

## 🔐 Segurança e CORS

### ✅ Sem Problemas de CORS
Os PDFs são servidos **localmente** junto com o projeto, então:
- Não há bloqueios de origem cruzada
- O navegador serve tudo da mesma origem (`http://localhost:3000`)
- Sem necessidade de proxies ou headers especiais

### ✅ PDF.js Worker Configurado
O arquivo `src/equipment.js` já está corretamente configurado:
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
```

---

## 📝 Mudanças Realizadas em `data.js`

Todos os caminhos foram atualizados de:
```javascript
pdfUrl: 'pdfs/pop_arquivo_placeholder.pdf'  // Antes
```

Para os nomes reais:
```javascript
pdfUrl: 'pdfs/POP_AGITADOR_MAGNETICO_COM_AQUECIMENTO.pdf'  // Depois
```

### Exemplos de Atualizações:
- **Analises Clínicas**: 17 equipamentos com PDFs atualizados
- **Biossegurança**: 3-4 equipamentos com PDFs atualizados
- **Microscopia**: 3 equipamentos com PDFs atualizados
- **Multididático**: 15 equipamentos com PDFs atualizados

---

## 🆘 Troubleshooting

### Problema: PDFs não aparecem no navegador
**Solução**: 
1. Verifique se a pasta `pdfs/` existe: `C:\Users\Jorge\Downloads\iftracker\pdfs\`
2. Verifique se os arquivos foram copiados: `dir pdfs/ /B`
3. Reinicie o servidor: `npm run dev`
4. Limpe o cache do navegador (Ctrl+F5)

### Problema: Visualizador PDF não carrega
**Solução**:
1. Abra o console (F12) e procure por erros de rede
2. Verifique o URL do PDF na aba Network
3. Certifique-se que o arquivo existe naquele caminho
4. Tente acessar o PDF diretamente: `http://localhost:3000/pdfs/NOME_DO_PDF.pdf`

### Problema: Contador de páginas está "0"
**Solução**: O PDF não foi carregado corretamente, verifique o console para erros

---

## ✨ Funcionalidades do Visualizador

Após o setup completo, cada equipamento com PDF terá:

### 🔍 **Zoom**
- Botão `+` para aumentar (máximo 300%)
- Botão `-` para diminuir (mínimo 50%)
- Display em % do zoom atual

### ⬅️➡️ **Navegação**
- Botão `←` para página anterior
- Botão `→` para próxima página
- Campo numérico para ir direto a uma página
- Indicador: "Página X / Y"

### 🔎 **Busca Interna**
- Campo de texto para pesquisar no PDF
- Botões para próxima/anterior ocorrência
- Pula automaticamente para a página com o resultado

### 💾 **Download**
- Botão para baixar o PDF original

---

## 📞 Próximas Ações

1. **Execute o script de cópia** (qualquer opção acima)
2. **Inicie o servidor**: `npm run dev`
3. **Teste no navegador**: http://localhost:3000
4. **Verifique tudo funciona** conforme esperado

---

**Data de Configuração**: 2026-05-19  
**Versão**: 1.0  
**Status**: Pronto para cópia de PDFs ✅
