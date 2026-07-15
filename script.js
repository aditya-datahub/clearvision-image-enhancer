

document.addEventListener('DOMContentLoaded', () => {

    const fileInput        = document.getElementById('fileInput');
    const uploadBox        = document.getElementById('uploadBox');
    const originalImage    = document.getElementById('originalImage');
    const enhancedImage    = document.getElementById('enhancedImage');
    const origPlaceholder  = document.getElementById('origPlaceholder');
    const enhPlaceholder   = document.getElementById('enhPlaceholder');
    const originalSize     = document.getElementById('originalSize');
    const enhancedSize     = document.getElementById('enhancedSize');
    const enhSizeTag       = document.getElementById('enhSizeTag');
    const enhanceBtn       = document.getElementById('enhanceBtn');
    const downloadBtn      = document.getElementById('downloadBtn');
    const loaderOverlay    = document.getElementById('loaderOverlay');
    const loaderStep       = document.getElementById('loaderStep');
    const loaderSub        = document.getElementById('loaderSub');
    const msgBar           = document.getElementById('msgBar');
    const statLevel        = document.getElementById('statLevel');


    const statAlgos        = document.getElementById('statAlgos');
    const barLevel         = document.getElementById('barLevel');


    const barAlgos         = document.getElementById('barAlgos');
    const algoBadge        = document.getElementById('algoBadge');
    const algoCheckboxes   = document.querySelectorAll('input[name="algo"]');
    const factorButtons    = document.querySelectorAll('.s-btn');

    const sideBySide       = document.getElementById('sideBySide');
    const compareSection   = document.getElementById('compareSection');
    const compareContainer = document.getElementById('compareContainer');
    const compareDivider   = document.getElementById('compareDivider');
    const compareClip      = document.getElementById('compareClip');
    const compareTop       = document.getElementById('compareTop');
    const compareBottom    = document.getElementById('compareBottom');
    const toggleBar        = document.getElementById('toggleBar');
    const btnSideBySide    = document.getElementById('btnSideBySide');
    const btnCompare       = document.getElementById('btnCompare');

    let comparePct = 50;

    function showSideBySide() {
        sideBySide.style.display    = 'grid';
        compareSection.style.display= 'none';
        btnSideBySide.classList.add('active');
        btnCompare.classList.remove('active');
    }
    function showCompare() {
        sideBySide.style.display    = 'none';
        compareSection.style.display= 'block';
        btnCompare.classList.add('active');
        btnSideBySide.classList.remove('active');
        setComparePct(50);

        const cw = compareContainer.offsetWidth;
        if (cw) compareTop.style.width = cw + 'px';
    }
    function setComparePct(pct) {
        comparePct = Math.max(2, Math.min(98, pct));
        compareClip.style.width    = comparePct + '%';
        compareDivider.style.left  = comparePct + '%';
        const cw = compareContainer.offsetWidth;
        if (cw) compareTop.style.width = cw + 'px';
    }
    function handleCompareMove(clientX) {
        const rect = compareContainer.getBoundingClientRect();
        setComparePct(((clientX - rect.left) / rect.width) * 100);
    }

    compareContainer.addEventListener('mousedown', e => {
        e.preventDefault();
        handleCompareMove(e.clientX);
        const mv = ev => handleCompareMove(ev.clientX);
        const up = ()  => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup',   up);
    });
    compareContainer.addEventListener('touchstart', e => handleCompareMove(e.touches[0].clientX), { passive: true });
    compareContainer.addEventListener('touchmove',  e => handleCompareMove(e.touches[0].clientX), { passive: true });

    btnSideBySide.addEventListener('click', showSideBySide);
    btnCompare.addEventListener('click', showCompare);

    function activateCompareUI(origURL, enhURL) {
        compareTop.src    = origURL;
        compareBottom.src = enhURL;
        toggleBar.classList.add('visible');

    }

    let originalDataURL  = null;
    let enhancedDataURL  = null;
    let originalFileSize = 0;
    let originalFileName = 'image';
    let enhanceLevel     = 1;

    refreshBadge();
    algoCheckboxes.forEach(cb => cb.addEventListener('change', refreshBadge));
    initStrengthButtons();
    initEventListeners();

    function refreshBadge() {
        const n = [...algoCheckboxes].filter(c => c.checked).length;
        algoBadge.textContent = n + ' selected';
    }
    function getSelectedAlgos() {
        return [...algoCheckboxes].filter(c => c.checked).map(c => c.value);
    }

    function initStrengthButtons() {
        factorButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                factorButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                enhanceLevel = parseInt(this.dataset.factor, 10);
                const labels = { 1: 'Light', 2: 'Medium', 3: 'Max' };
                statLevel.textContent    = labels[enhanceLevel];
                barLevel.style.width     = (enhanceLevel / 3 * 100) + '%';
            });
        });
    }

    function initEventListeners() {
        uploadBox.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);

        uploadBox.addEventListener('dragover',  e => { e.preventDefault(); uploadBox.classList.add('drag-over'); });
        uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('drag-over'));
        uploadBox.addEventListener('drop', e => {
            e.preventDefault();
            uploadBox.classList.remove('drag-over');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect();
            }
        });

        enhanceBtn.addEventListener('click', runEnhancement);
        downloadBtn.addEventListener('click', downloadResult);
    }

    function fmtSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024, u = ['B','KB','MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + u[i];
    }

    function showMsg(txt, type) {
        msgBar.textContent = txt;
        msgBar.className   = 'msg-bar ' + type;
        if (type === 'success') setTimeout(() => { msgBar.className = 'msg-bar'; }, 5000);
    }

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (!file) return;
        if (!file.type.match('image.*'))  { showMsg('Please select a valid image (JPG, PNG, WebP).', 'error'); return; }
        if (file.size > 10 * 1024 * 1024) { showMsg('File must be under 10 MB.', 'error'); return; }

        originalFileName = file.name.replace(/\.[^.]+$/, '');
        originalFileSize = file.size;
        originalSize.textContent = fmtSize(file.size);

        const reader = new FileReader();
        reader.onload = e => {
            originalDataURL = e.target.result;
            originalImage.src           = e.target.result;
            originalImage.style.display = 'block';
            origPlaceholder.style.display = 'none';
            enhancedImage.style.display = 'none';
            enhPlaceholder.style.display = 'flex';
            enhSizeTag.style.display     = 'none';



            statAlgos.textContent = '--'; barAlgos.style.width = '0%';

            toggleBar.classList.remove('visible');
            showSideBySide();

            enhanceBtn.disabled  = false;
            downloadBtn.disabled = true;
            enhancedDataURL      = null;
            showMsg('Image loaded — select algorithms and click Enhance.', 'success');
        };
        reader.onerror = () => showMsg('Failed to read the file.', 'error');
        reader.readAsDataURL(file);
    }

    function runEnhancement() {
        if (!originalDataURL)  { showMsg('Please upload an image first.', 'error'); return; }
        const selected = getSelectedAlgos();
        if (!selected.length)  { showMsg('Select at least one algorithm.', 'error'); return; }

        loaderOverlay.classList.add('active');
        msgBar.className   = 'msg-bar';
        enhanceBtn.disabled = true;

        const labels = {
            Bilateral:   'Bilateral Filter',
            CLAHE:       'CLAHE',
            USM:         'Unsharp Masking',
            Saturation:  'Saturation Boost',
        };

        const steps    = selected.map(k => labels[k] || k);
        const duration = 800 + steps.length * 350;
        let idx = 0;
        const ticker = setInterval(() => {
            if (idx < steps.length) {
                loaderStep.textContent = steps[idx] + '…';
                loaderSub.textContent  = 'Step ' + (idx + 1) + ' of ' + steps.length;
                idx++;
            }
        }, duration / (steps.length + 1));

        setTimeout(() => {
            clearInterval(ticker);
            loaderStep.textContent = 'Finalising…';
            loaderSub.textContent  = '';

            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width  = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d', { alpha: false });
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0);

                    applyPipeline(ctx, canvas.width, canvas.height, selected, enhanceLevel);

                    enhancedDataURL = canvas.toDataURL('image/jpeg', 0.94);
                    enhancedImage.src           = enhancedDataURL;
                    enhancedImage.style.display = 'block';
                    enhPlaceholder.style.display = 'none';
                    enhSizeTag.style.display     = 'inline-flex';

                    updateStats(selected.length);
                    loaderOverlay.classList.remove('active');
                    enhanceBtn.disabled  = false;
                    downloadBtn.disabled = false;
                    showMsg('✓ Enhancement complete — ' + selected.length + ' algorithm' + (selected.length > 1 ? 's' : '') + ' applied. Use the Compare Slider to see the difference.', 'success');

                    activateCompareUI(originalDataURL, enhancedDataURL);
                } catch (err) {
                    console.error(err);
                    loaderOverlay.classList.remove('active');
                    enhanceBtn.disabled = false;
                    showMsg('Processing error — check console for details.', 'error');
                }
            };
            img.onerror = () => {
                loaderOverlay.classList.remove('active');
                enhanceBtn.disabled = false;
                showMsg('Failed to load image for processing.', 'error');
            };
            img.src = originalDataURL;
        }, duration);
    }

    function applyPipeline(ctx, w, h, selected, lvl) {
        const PIPELINE_ORDER = [
            'Bilateral',
            'CLAHE',
            'USM',
            'Saturation',
        ];

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        const original = new Uint8ClampedArray(d);

        for (const algo of PIPELINE_ORDER) {
            if (!selected.includes(algo)) continue;

            switch (algo) {

                case 'Bilateral':
                    applyBilateral(d, w, h);
                    break;

                case 'CLAHE':
                    applyCLAHE(d, w, h, 32, 1.5);
                    break;

                case 'USM':
                    applyUSM(d, w, h, lvl === 1 ? 0.30 : lvl === 2 ? 0.45 : 0.60);
                    break;

                case 'Saturation':
                    applySaturation(d, lvl === 1 ? 1.10 : lvl === 2 ? 1.18 : 1.28);
                    break;
            }
        }

        const n = selected.length;
        const pw = Math.max(0.55, 0.88 - n * 0.033);
        const ow = 1 - pw;
        for (let i = 0; i < d.length; i += 4) {
            d[i]   = Math.round(d[i]   * pw + original[i]   * ow);
            d[i+1] = Math.round(d[i+1] * pw + original[i+1] * ow);
            d[i+2] = Math.round(d[i+2] * pw + original[i+2] * ow);
        }

        ctx.putImageData(imgData, 0, 0);
    }

    function gaussKernel1D(radius, sigma) {
        const k = [];
        let sum = 0;
        for (let x = -radius; x <= radius; x++) {
            const v = Math.exp(-(x * x) / (2 * sigma * sigma));
            k.push(v); sum += v;
        }
        return k.map(v => v / sum);
    }

    function gaussianBlurBuffer(buf, w, h, radius, sigma) {
        const k   = gaussKernel1D(radius, sigma);
        const tmp = new Float32Array(buf.length);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r=0,g=0,b=0,wt=0;
                for (let i = -radius; i <= radius; i++) {
                    const nx = Math.min(w-1, Math.max(0, x+i));
                    const kw = k[i+radius];
                    const ni = (y*w+nx)*4;
                    r += buf[ni]*kw; g += buf[ni+1]*kw; b += buf[ni+2]*kw; wt += kw;
                }
                const oi = (y*w+x)*4;
                tmp[oi]=r/wt; tmp[oi+1]=g/wt; tmp[oi+2]=b/wt; tmp[oi+3]=buf[oi+3];
            }
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r=0,g=0,b=0,wt=0;
                for (let i = -radius; i <= radius; i++) {
                    const ny = Math.min(h-1, Math.max(0, y+i));
                    const kw = k[i+radius];
                    const ni = (ny*w+x)*4;
                    r += tmp[ni]*kw; g += tmp[ni+1]*kw; b += tmp[ni+2]*kw; wt += kw;
                }
                const oi = (y*w+x)*4;
                buf[oi]  =Math.round(r/wt);
                buf[oi+1]=Math.round(g/wt);
                buf[oi+2]=Math.round(b/wt);
            }
        }
    }

    function applyLumaRatio(d, idx, origL, newL) {
        if (origL < 1) return;

        const ratio = Math.min(1.6, Math.max(0.75, newL / origL));

        const blend = 0.5;
        d[idx]  = Math.min(255, Math.max(0, Math.round(d[idx]   * (1 - blend + blend * ratio))));
        d[idx+1]= Math.min(255, Math.max(0, Math.round(d[idx+1] * (1 - blend + blend * ratio))));
        d[idx+2]= Math.min(255, Math.max(0, Math.round(d[idx+2] * (1 - blend + blend * ratio))));
    }

    function applyBilateral(d, w, h) {
        const radius = 2, sigmaS = 10, sigmaR = 25;
        const copy   = new Uint8ClampedArray(d);
        const twoSS2 = 2*sigmaS*sigmaS;
        const twoSR2 = 2*sigmaR*sigmaR;

        for (let y = radius; y < h-radius; y++) {
            for (let x = radius; x < w-radius; x++) {
                const ci = (y*w+x)*4;
                let sR=0,sG=0,sB=0,sw=0;
                for (let dy=-radius; dy<=radius; dy++) {
                    for (let dx=-radius; dx<=radius; dx++) {
                        const ni   = ((y+dy)*w+(x+dx))*4;
                        const spat = Math.exp(-(dx*dx+dy*dy)/twoSS2);
                        const dr   = copy[ni]-copy[ci];
                        const dg   = copy[ni+1]-copy[ci+1];
                        const db   = copy[ni+2]-copy[ci+2];
                        const rang = Math.exp(-(dr*dr+dg*dg+db*db)/twoSR2);
                        const wt   = spat*rang;
                        sR+=copy[ni]*wt; sG+=copy[ni+1]*wt; sB+=copy[ni+2]*wt; sw+=wt;
                    }
                }
                d[ci]  =Math.round(sR/sw);
                d[ci+1]=Math.round(sG/sw);
                d[ci+2]=Math.round(sB/sw);
            }
        }
    }

    function applyCLAHE(d, w, h, tileSize, clipLimit) {
        const n      = w*h;
        const tilesX = Math.ceil(w/tileSize);
        const tilesY = Math.ceil(h/tileSize);

        const L = new Uint8ClampedArray(n);
        for (let i=0;i<n;i++) {
            L[i] = Math.round(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2]);
        }

        function buildLUT(pixels) {
            const hist = new Int32Array(256);
            for (const v of pixels) hist[v]++;
            const clip = Math.ceil(clipLimit*pixels.length/256);
            let excess = 0;
            for (let i=0;i<256;i++) { if(hist[i]>clip){excess+=hist[i]-clip;hist[i]=clip;} }
            const add = Math.floor(excess/256);
            for (let i=0;i<256;i++) hist[i]+=add;
            const cdf = new Float32Array(256);
            cdf[0]=hist[0];
            for (let i=1;i<256;i++) cdf[i]=cdf[i-1]+hist[i];
            const cMin = cdf.find(v=>v>0)||0;
            const pn   = pixels.length;
            const lut  = new Uint8ClampedArray(256);
            for (let i=0;i<256;i++) {
                lut[i] = pn>cMin ? Math.round((cdf[i]-cMin)/(pn-cMin)*255) : i;
            }
            return lut;
        }

        const luts = [];
        for (let ty=0;ty<tilesY;ty++) {
            luts[ty]=[];
            for (let tx=0;tx<tilesX;tx++) {
                const x0=tx*tileSize, y0=ty*tileSize;
                const x1=Math.min(x0+tileSize,w), y1=Math.min(y0+tileSize,h);
                const pix=[];
                for (let y=y0;y<y1;y++) for (let x=x0;x<x1;x++) pix.push(L[y*w+x]);
                luts[ty][tx]=buildLUT(pix);
            }
        }

        for (let y=0;y<h;y++) {
            for (let x=0;x<w;x++) {
                const v   = L[y*w+x];
                const txf = x/tileSize-0.5;
                const tyf = y/tileSize-0.5;
                const tx0 = Math.max(0,Math.floor(txf));
                const tx1 = Math.min(tilesX-1,tx0+1);
                const ty0 = Math.max(0,Math.floor(tyf));
                const ty1 = Math.min(tilesY-1,ty0+1);
                const wx  = Math.max(0,txf-tx0);
                const wy  = Math.max(0,tyf-ty0);
                const newV = Math.round(
                    luts[ty0][tx0][v]*(1-wx)*(1-wy)+
                    luts[ty0][tx1][v]*   wx *(1-wy)+
                    luts[ty1][tx0][v]*(1-wx)*   wy +
                    luts[ty1][tx1][v]*   wx *   wy
                );
                applyLumaRatio(d,(y*w+x)*4,v,newV);
            }
        }
    }

    function applyUSM(d, w, h, amount) {

        const blurred = new Uint8ClampedArray(d);
        gaussianBlurBuffer(blurred, w, h, 1, 1.0);

        for (let i=0;i<d.length;i+=4) {
            for (let c=0;c<3;c++) {
                const edge = d[i+c] - blurred[i+c];
                d[i+c] = Math.min(255,Math.max(0, Math.round(d[i+c] + amount*edge)));
            }
        }
    }

    function applySaturation(d, factor) {
        function hue2rgb(p,q,t){
            if(t<0)t+=1; if(t>1)t-=1;
            if(t<1/6)return p+(q-p)*6*t;
            if(t<1/2)return q;
            if(t<2/3)return p+(q-p)*(2/3-t)*6;
            return p;
        }

        for(let i=0;i<d.length;i+=4){
            const r=d[i]/255, g=d[i+1]/255, b=d[i+2]/255;
            const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
            if(mx===mn) continue;

            const l=(mx+mn)/2;
            const dd=mx-mn;
            let   s=l>0.5 ? dd/(2-mx-mn) : dd/(mx+mn);
            s=Math.min(1, s*factor);

            const q2=l<0.5 ? l*(1+s) : l+s-l*s;
            const p2=2*l-q2;
            let h=0;
            if     (mx===r) h=(g-b)/dd+(g<b?6:0);
            else if(mx===g) h=(b-r)/dd+2;
            else            h=(r-g)/dd+4;
            h/=6;

            d[i]  =Math.min(255,Math.round(hue2rgb(p2,q2,h+1/3)*255));
            d[i+1]=Math.min(255,Math.round(hue2rgb(p2,q2,h    )*255));
            d[i+2]=Math.min(255,Math.round(hue2rgb(p2,q2,h-1/3)*255));
        }
    }

    function updateStats(numAlgos) {
        try {
            const b64   = enhancedDataURL.split(',')[1];
            const eSize = Math.floor(b64.length * 0.75);
            enhancedSize.textContent = fmtSize(eSize);

            statAlgos.textContent = numAlgos;
            barAlgos.style.width  = Math.min(100, numAlgos * 14) + '%';
        } catch (_) {
        }
    }

    function downloadResult() {
        if (!enhancedDataURL) { showMsg('Nothing to download yet.', 'error'); return; }
        const a = document.createElement('a');
        a.href     = enhancedDataURL;
        a.download = originalFileName + '_enhanced_' + Date.now() + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showMsg('Downloading enhanced image…', 'success');
    }

});
