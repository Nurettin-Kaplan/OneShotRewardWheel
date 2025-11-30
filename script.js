/* --- AYARLAR --- */
const prizes = [
    { text: "%10 İNDİRİM", color: "#00529b", txtColor: "#fff" }, // 0
    { text: "KARGO BEDAVA", color: "#ffffff", txtColor: "#00529b" }, // 1
    { text: "%5 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "SÜRPRİZ HEDİYE", color: "#ffffff", txtColor: "#00529b" },
    { text: "%20 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "TEKRAR DENE", color: "#ffffff", txtColor: "#00529b" }, // 5
    { text: "%15 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "50 TL KUPON", color: "#ffffff", txtColor: "#00529b" }
];

let gameState = {
    spinCount: 0,
    maxSpins: 2,
    isSpinning: false,
    rotation: 0 
};

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('spinBtn');

const size = 800;
const centerX = size / 2;
const centerY = size / 2;
const radius = size / 2 - 20; 
const arc = (2 * Math.PI) / prizes.length;

function drawWheel() {
    ctx.clearRect(0, 0, size, size);

    // Dış Süslemeler
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.lineWidth = 15; ctx.strokeStyle = "#e0e0e0"; ctx.stroke();
    ctx.shadowBlur = 0;

    for(let j=0; j<16; j++) {
        const dotAngle = (j * (360/16)) * (Math.PI/180);
        const dotX = centerX + (radius + 5) * Math.cos(dotAngle);
        const dotY = centerY + (radius + 5) * Math.sin(dotAngle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#00529b"; ctx.fill();
    }

    // Dilimler
    for (let i = 0; i < prizes.length; i++) {
        const angle = i * arc;
        
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth = 2; ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = prizes[i].txtColor;
        ctx.font = "bold 30px 'Montserrat', sans-serif"; // Fontu sabit tuttum (24-28px arası ideal)
        ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 4;
        ctx.fillText(prizes[i].text, radius - 40, 10); 
        ctx.restore();
    }

    // Orta Göbek
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#ddd"; ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = "#00529b";
    let grd = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 35);
    grd.addColorStop(0, "#0066cc");
    grd.addColorStop(1, "#004080");
    ctx.fillStyle = grd; ctx.fill();
}

btn.onclick = () => {
    if (gameState.isSpinning || gameState.spinCount >= gameState.maxSpins) return;

    gameState.isSpinning = true;
    btn.disabled = true;
    btn.innerHTML = "ŞANSIN DÖNÜYOR...";

    // 1. HEDEF BELİRLE
    let targetIndex;
    if (gameState.spinCount === 0) {
        targetIndex = 5; 
    } else {
        do {
            targetIndex = Math.floor(Math.random() * 8);
        } while (targetIndex === 5);
    }

    // 2. MATEMATİKSEL DÜZELTME (HİZALAMA GARANTİSİ)
    const sliceAngle = 360 / prizes.length; // 45 derece
    
    // Rastgelelik: +/- 15 derece (22.5 derecelik yarı dilimin içinde güvenli alan)
    const randomOffset = Math.floor(Math.random() * 30) - 15; 

    // ÖNEMLİ DÜZELTME BURADA:
    // (sliceAngle / 2) yani 22.5 dereceyi çıkararak, 
    // hedefi dilimin başlangıcına değil, tam ORTASINA çekiyoruz.
    const centerOffset = sliceAngle / 2;

    // Formül: (360 - (Hedef * 45)) - 90 - (22.5) + Rastgelelik
    const targetRotation = (360 - (targetIndex * sliceAngle)) - 90 - centerOffset + randomOffset;

    const spins = 3600; 
    const currentRot = gameState.rotation;
    const newRot = currentRot + spins + (targetRotation - (currentRot % 360));
    const finalRot = newRot < currentRot ? newRot + 360 : newRot;

    gameState.rotation = finalRot;

    const wheelCanvas = document.getElementById('wheelCanvas');
    wheelCanvas.style.transition = 'transform 4s cubic-bezier(0.2, 0, 0.2, 1)';
    wheelCanvas.style.transform = `rotate(${gameState.rotation}deg)`;

    setTimeout(() => {
        gameState.isSpinning = false;
        gameState.spinCount++;
        showResult(targetIndex);
    }, 4000); 
};

function showResult(index) {
    const res = document.getElementById('winnerResult');
    const title = document.getElementById('modalTitle');
    const mBtn = document.getElementById('modalBtn');
    const msg = document.getElementById('modalMsg');
    const sub = document.getElementById('modalSub');

    res.innerText = prizes[index].text;

    if (index === 5) { 
        title.innerText = "BİR DAHA DENE! 😮";
        msg.innerText = "Şansın yaver gitmedi ama...";
        res.innerText = "TEKRAR DENE";
        sub.innerText = "Üzülme, sana özel 1 hakkın daha var!";
        mBtn.innerText = "TEKRAR ÇEVİR";
    } else { 
        title.innerText = "TEBRİKLER! 🎉";
        msg.innerText = "Kazandığın Ödül:";
        sub.innerText = "Ekran görüntüsü al ve bize DM at!";
        mBtn.innerText = "HARİKA!";
        fireConfetti();
        btn.innerText = "HAKKINIZ BİTTİ";
    }

    document.getElementById('resultModal').classList.add('active');
}

function closeModal() {
    document.getElementById('resultModal').classList.remove('active');
    if (gameState.spinCount < gameState.maxSpins) {
        btn.disabled = false;
        btn.innerText = "SON ŞANSINI DENE!";
    }
}

function fireConfetti() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00529b', '#ffffff'] });
}

drawWheel();