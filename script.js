/* --- YAPILANDIRMA --- */
const prizes = [
    { text: "%10 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "KARGO BEDAVA", color: "#ffffff", txtColor: "#00529b" },
    { text: "%5 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "SÜRPRİZ HEDİYE", color: "#ffffff", txtColor: "#00529b" },
    { text: "%20 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "TEKRAR DENE", color: "#ffffff", txtColor: "#00529b" }, // Index 5
    { text: "%15 İNDİRİM", color: "#00529b", txtColor: "#fff" },
    { text: "50 TL KUPON", color: "#ffffff", txtColor: "#00529b" }
];

let gameState = {
    spinCount: 0,
    maxSpins: 2,
    isSpinning: false,
    rotation: 0 // Çarkın mevcut dönüş derecesi (Üstüne ekleyeceğiz)
};

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('spinBtn');

const size = 800; // Yüksek çözünürlük
const centerX = size / 2;
const centerY = size / 2;
const radius = size / 2 - 20; 
const arc = (2 * Math.PI) / prizes.length;

/* --- ÇİZİM --- */
function drawWheel() {
    ctx.clearRect(0, 0, size, size);

    // 1. DIŞ HALKA VE VİDALAR
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#e6e6e6"; // Biraz daha açık gri
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dekoratif noktalar (Mavi)
    for(let j=0; j<16; j++) {
        const angle = (j * (360/16)) * (Math.PI/180);
        const x = centerX + (radius + 5) * Math.cos(angle);
        const y = centerY + (radius + 5) * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00529b";
        ctx.fill();
    }

    // 2. DİLİMLER
    for (let i = 0; i < prizes.length; i++) {
        const angle = i * arc;
        
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. YAZILAR (Modern Font)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = prizes[i].txtColor;
        ctx.font = "bold 32px 'Montserrat', sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 4;
        ctx.fillText(prizes[i].text, radius - 30, 10);
        ctx.restore();
    }

    // 4. ORTA GÖBEK
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ddd";
    ctx.stroke();

    // Orta Mavi Daire
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = "#00529b";
    // Gradyan efekti (hafif parlama)
    let grd = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 35);
    grd.addColorStop(0, "#0073e6");
    grd.addColorStop(1, "#00529b");
    ctx.fillStyle = grd;
    ctx.fill();
}

/* --- HAREKET VE MANTIK --- */
btn.onclick = () => {
    if (gameState.isSpinning || gameState.spinCount >= gameState.maxSpins) return;

    gameState.isSpinning = true;
    btn.disabled = true;
    btn.innerHTML = "ŞANSIN DÖNÜYOR...";

    // 1. HEDEF BELİRLE (HİLELİ)
    let targetIndex;
    if (gameState.spinCount === 0) {
        targetIndex = 5; // İlk tur kesinlikle TEKRAR DENE
    } else {
        do {
            targetIndex = Math.floor(Math.random() * 8);
        } while (targetIndex === 5); // İkinci tur TEKRAR DENE HARİÇ her şey
    }

    // 2. AÇI HESAPLAMA (DOĞAL DÖNÜŞ İÇİN)
    // Bir dilim kaç derece?
    const sliceAngle = 360 / prizes.length;
    
    // Rastgelelik ekle: Tam ortaya değil, dilimin içinde rastgele bir yere dursun
    // Dilim genişliğinin %80'i kadar güvenli alanda rastgele bir ofset üret
    const randomOffset = Math.floor(Math.random() * (sliceAngle * 0.8)) - (sliceAngle * 0.4);
    
    // Canvas'ta 0 noktası SAĞ (3 Yönü), Ok ise ÜST (12 Yönü). Fark -90 derece.
    // Formül: (360 - (HedefIndex * DilimAçısı)) - 90 + Rastgelelik
    let targetRotation = (360 - (targetIndex * sliceAngle)) - 90 + randomOffset;
    
    // En az 5 tam tur (1800 derece) ekle
    // Mevcut dönüşün üzerine ekle ki geri sarmasın
    const spins = 3600; // 10 tam tur
    
    // Modüler aritmetikle "mevcut açının üzerine" hedefi bindiriyoruz.
    // Hedeflenen mutlak açı
    let absoluteTarget = gameState.rotation + spins + (targetRotation - (gameState.rotation % 360));
    
    // Eğer hesaplama negatifse veya geride kalıyorsa bir tur daha ekle düzelt
    if (absoluteTarget < gameState.rotation) absoluteTarget += 360;

    gameState.rotation = absoluteTarget; // State güncelle

    // 3. ANİMASYONU UYGULA (CSS TRANSITION)
    const wheelCanvas = document.getElementById('wheelCanvas');
    
    // cubic-bezier(0.25, 0.1, 0.25, 1) -> Doğal yavaşlama efekti
    wheelCanvas.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    wheelCanvas.style.transform = `rotate(${gameState.rotation}deg)`;

    // 4. SONUÇ EKRANI
    setTimeout(() => {
        gameState.isSpinning = false;
        gameState.spinCount++;
        showResult(targetIndex);
    }, 5000); // 5 saniye bekle
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

// Başlangıç çizimi
drawWheel();