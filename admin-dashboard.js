'use strict';

const STATUS_META = {
    compliant: { label: 'Uyumlu', icon: 'fa-check-circle', className: 'status-pill status-compliant' },
    warning: { label: 'Gözden Geçir', icon: 'fa-exclamation-triangle', className: 'status-pill status-warning' },
    review: { label: 'Denetim Planlandı', icon: 'fa-flag', className: 'status-pill status-review' }
};

const PROCEDURE_DATA = [
    {
        id: 'product-onboarding',
        title: 'Ürün Ekleme Prosedürü',
        icon: 'fa-box-open',
        owner: 'Satıcı Operasyon Ekibi',
        status: 'compliant',
        summary: 'Ürünlerin sisteme hatasız şekilde alınması ve stok kayıtlarının doğrulanması.',
        lastAudit: '2025-11-03',
        nextReview: '2025-12-02',
        auditNote: 'Form alanları ve birim kontrolleri 3 Kasım denetiminde sorunsuz geçti.',
        sentences: [
            'Rolüne ait panele giriş yapan kullanıcı Ürün Yönetimi sekmesine geçer ve Yeni Ürün Ekle butonuna tıklar.',
            'Ürün adı, açıklaması, kategori ve marka alanları prosedürde tanımlandığı biçimde eksiksiz doldurulur.',
            'Birim seçimi yalnızca kg, m², m³, litre, gram veya adet seçeneklerinden biriyle yapılır ve seçime göre fiyat alanı doğrulanır.',
            'Birim fiyatı, stok miktarı ve minimum sipariş değerleri seçilen birimle tutarlı olacak şekilde girilir.',
            'Ürün görselleri yüklenir, optimizasyon kontrolü yapılır ve Kaydet butonu ile kayıt tamamlanır.',
            'Kayıt sonrası ürün listesi kontrol edilerek başarı mesajı doğrulanır ve log kaydı alınır.'
        ],
        controls: [
            'Birim seçimi prosedürdeki altı seçenekle sınırlandırılmıştır.',
            'Fiyat ve stok alanları minimum sipariş kuralına göre çift kontrol edilir.',
            'Kaydetme sonrası ürün listesinde yepyeni kayıt doğrulanır ve loglanır.'
        ],
        checklist: [
            'Yetki doğrulaması yapıldı ve panel erişim loglandı.',
            'Birim ve fiyat alanları seçilen ölçü ile uyumlu.',
            'Ürün kaydı sonrası liste ekranında görünürlük kontrol edildi.'
        ],
        docs: [
            { label: 'PROCEDURES_WORKFLOW.md §38', href: 'workflow-documentation.html#urun-ekleme', description: 'Ürün Ekleme Prosedürü detayı' }
        ],
        tags: ['Ürün', 'Stok', 'Form Doğrulaması']
    },
    {
        id: 'order-management',
        title: 'Sipariş Yönetimi Prosedürü',
        icon: 'fa-arrows-rotate',
        owner: 'Operasyon Koordinasyon Ekibi',
        status: 'compliant',
        summary: 'Talep, onay, üretim ve ödeme süreçlerini uçtan uca tanımlar.',
        lastAudit: '2025-11-01',
        nextReview: '2025-11-29',
        auditNote: 'Sipariş akışı ve departmanlar arası transferler 1 Kasım kontrolünde onaylandı.',
        sentences: [
            'Hammaddeci ürün talebini başlatır; üretici stok kontrolü yapar ve teklif hazırlar.',
            'Hammaddeci teklifi değerlendirir, onaylanan siparişler üretim sürecine aktarılır.',
            'Üretici siparişi tamamlar, kalite kontrol yapar ve stok transferini toptancıya gerçekleştirir.',
            'Toptancı stok yönetimini yürütür ve ürünleri satıcıya aktarır.',
            'Satıcı müşteriye satış işlemini tamamlar, ödeme bildirimi admin paneline düşer.',
            'Admin komisyon hesaplamasını yapar ve taraflara ödeme transferini gerçekleştirir.'
        ],
        controls: [
            'Her rol için stok ve kalite kontrol kayıtları tutulur.',
            'Onaylanan siparişler üretim tamamlanmadan stok çıkışına izin vermez.',
            'Ödeme transferi sonrası taraflara dekont iletildiği loglanır.'
        ],
        checklist: [
            'Talep ve teklif logları CRM ile senkronize edildi.',
            'Üretim kalite kontrol raporu sisteme yüklendi.',
            'Ödeme transfer dekontu paylaşıldı ve komisyon hesaplaması doğrulandı.'
        ],
        docs: [
            { label: 'PROCEDURES_WORKFLOW.md §107', href: 'workflow-documentation.html#siparis-yonetimi', description: 'Sipariş Yönetimi Prosedürü' }
        ],
        tags: ['Sipariş', 'Operasyon', 'Departmanlar']
    },
    {
        id: 'payment-commission',
        title: 'Ödeme ve Komisyon Prosedürü',
        icon: 'fa-coins',
        owner: 'Finans & Muhasebe',
        status: 'review',
        summary: 'Merkezi ödeme sistemi, komisyon formülü ve dağıtım takvimini yönetir.',
        lastAudit: '2025-10-28',
        nextReview: '2025-11-15',
        auditNote: 'Komisyon formülü onaylandı, işlem ücretleri için güncelleme bekleniyor.',
        sentences: [
            'Müşteri ödemesi ve canlı yayın ücretleri admin hesabında toplanır.',
            'Toplam gelir üzerinden %5 platform komisyonu ve %2 işlem ücreti kesilir.',
            'Net bakiye hammadeci, üretici, toptancı ve satıcı paylarına dağıtılır.',
            'Ödeme takvimi gereği acil, haftalık, aylık ve özel planlar takip edilir.',
            'Her transfer öncesi IBAN doğrulaması ve bakiye kontrolü yapılır.',
            'Tamamlanan transferler finans raporlarına işlenir ve taraflara bildirilir.'
        ],
        controls: [
            'Komisyon formülü platform konfigürasyonu ile tutarlı olmalıdır.',
            'Ödeme takvimi tetikleyicileri otomasyon loglarında doğrulanır.',
            'Transfer sonrası hesap ekstresi arşivlenir.'
        ],
        checklist: [
            'Net bakiye hesaplaması paydaş bazında kontrol edildi.',
            'IBAN ve hesap unvanı eşleştirmesi yapıldı.',
            'Ödeme sonrası finans raporu güncellendi.'
        ],
        docs: [
            { label: 'PROCEDURES_WORKFLOW.md §161', href: 'workflow-documentation.html#odeme-sistemi', description: 'Ödeme ve Komisyon Prosedürü' }
        ],
        tags: ['Finans', 'Komisyon', 'Ödeme Takvimi']
    },
    {
        id: 'livestream',
        title: 'Canlı Yayın Prosedürü',
        icon: 'fa-broadcast-tower',
        owner: 'Canlı Yayın Operasyonları',
        status: 'warning',
        summary: 'Canlı yayına hazırlık, yayın süreci ve sonlandırma adımlarını yönetir.',
        lastAudit: '2025-10-30',
        nextReview: '2025-11-12',
        auditNote: 'Bakiye kontrol otomasyonunda iyileştirme planlandı; kontroller devam ediyor.',
        sentences: [
            'Yayın öncesi bakiye kontrol edilir, gerekirse bakiye yükleme akışı tamamlanır.',
            'Kamera ve mikrofon erişimleri doğrulanır, yayınlanacak ürün ve sloganlar hazırlanır.',
            'Canlı yayın başlatılarak ürün tanıtımı ve müşteri etkileşimi sürdürülür.',
            'Siparişler yayın sırasında kaydedilir ve satış ekibine aktarılır.',
            'Yayın sonlandırıldığında bakiye düşümü yapılır ve rapor oluşturulur.',
            'Son adımda yayın kapanış raporu ve sipariş takibi başlatılır.'
        ],
        controls: [
            'Bakiye yetersizse yayın başlatılamaz; yükleme ekranına otomatik yönlendirilir.',
            'Yayın ekipman testi (kamera, mikrofon) her yayın öncesi doğrulanır.',
            'Yayın sonrası rapor ve sipariş listesi CRM ile senkronize edilir.'
        ],
        checklist: [
            'Bakiye kontrol raporu incelendi.',
            'Ekipman testi logu kaydedildi.',
            'Yayın kapanış raporu dosyalandı.'
        ],
        docs: [
            { label: 'PROCEDURES_WORKFLOW.md §203', href: 'workflow-documentation.html#canli-yayin', description: 'Canlı Yayın Prosedürü' }
        ],
        tags: ['Canlı Yayın', 'Satış', 'Bakiye']
    },
    {
        id: 'admin-security',
        title: 'Admin Güvenlik Prosedürü',
        icon: 'fa-user-shield',
        owner: 'Güvenlik Operasyonları',
        status: 'warning',
        summary: 'Admin hesaplarının korunması, oturum kontrolü ve alarm süreçlerini kapsar.',
        lastAudit: '2025-11-04',
        nextReview: '2025-11-11',
        auditNote: 'Oturum süresi sınırı güncelleniyor; IP loglaması çalışıyor.',
        sentences: [
            'Admin erişimi yalnızca yetkilendirilmiş personellere verilir ve erişimler loglanır.',
            'Şifreler karmaşıklık politikasına uygun şekilde belirlenir ve düzenli olarak güncellenir.',
            'Oturum süresi sınırlaması uygulanır, pasif oturumlar otomatik olarak sonlandırılır.',
            'IP adresi kayıtları tutulur, şüpheli aktivite durumunda uyarı sistemi devreye girer.',
            'Alternatif admin hesapları (CEO vb.) için çift faktörlü doğrulama zorunludur.',
            'Güvenlik kontrolleri haftalık raporlanır ve eksikler için aksiyon tanımlanır.'
        ],
        controls: [
            'Şifre karmaşıklığı (uzunluk, karakter seti) denetlenir.',
            'Oturum süreleri ve başarısız giriş denemeleri loglanır.',
            'Şüpheli IP listesi güncel tutulur ve alarm sistemi test edilir.'
        ],
        checklist: [
            'Şifre politikası güncellendi ve iletişime açıldı.',
            'Oturum süresi sınırı test edildi.',
            'IP log kayıtları incelendi ve arşivlendi.'
        ],
        docs: [
            { label: 'PROCEDURES_WORKFLOW.md §260', href: 'workflow-documentation.html#guvenlik', description: 'Güvenlik ve Admin Prosedürü' }
        ],
        tags: ['Güvenlik', 'Kimlik Doğrulama', 'Loglama']
    },
    {
        id: 'emergency',
        title: 'Acil Durum Prosedürü',
        icon: 'fa-bolt',
        owner: 'Platform SRE Ekibi',
        status: 'review',
        summary: 'Sistem arızaları ve güvenlik ihlallerinde uygulanacak acil aksiyonları tanımlar.',
        lastAudit: '2025-10-26',
        nextReview: '2025-11-09',
        auditNote: 'İzolasyon planı güncellendi, raporlama şablonu yeniden düzenlenecek.',
        sentences: [
            'Sistem arızası veya güvenlik ihlali tespit edildiğinde acil bildirim tetiklenir.',
            'Hızlı müdahale ekibi olayı izolasyon prosedürüne göre sınırlar.',
            'Olay analizi gerçekleştirilir ve kök neden raporu hazırlanır.',
            'Gerekli düzeltme ve güvenlik önlemleri uygulanır.',
            'Sonuçlar raporlanır ve prosedür iyileştirmesi için geri bildirim alınır.'
        ],
        controls: [
            'Bildirim zinciri ve iletişim kanalları test edilir.',
            'İzolasyon adımları için runbook güncelliği doğrulanır.',
            'Raporlama şablonu ve kök neden analizi çıktıları arşivlenir.'
        ],
        checklist: [
            'Alarm kanalları test edildi.',
            'İzolasyon runbook’u gözden geçirildi.',
            'Olay raporu şablonu güncellendi.'
        ],
        docs: [
            { label: 'PROCEDURES_WORKFLOW.md §297', href: 'PROCEDURES_WORKFLOW.md', description: 'Acil Durum Prosedürü' }
        ],
        tags: ['Acil Durum', 'SRE', 'Olay Yönetimi']
    }
];

const DEPARTMENT_USERS = [
    { department: 'Admin - Sistem', role: 'admin', email: 'admin@videosat.com', password: 'admin123', companyName: 'VideoSat Yönetim', firstName: 'Admin', lastName: 'Kullanıcısı', notes: 'Ana yönetici hesabı. İlk giriş sonrası MFA etkinleştirin.' },
    { department: 'Admin - Yedek', role: 'admin', email: 'admin@basvideo.com', password: 'admin123', companyName: 'VideoSat Yönetim', firstName: 'Admin', lastName: 'VideoSat', notes: 'Yedek yönetici hesabı. Sadece acil durumlarda kullanın.' },
    { department: 'Hammadde Tedarik', role: 'hammaddeci', email: 'hammaddeci@videosat.com', password: 'test123', companyName: 'Hammadde Tedarik A.Ş.', firstName: 'Hammadde', lastName: 'Yetkilisi', notes: 'Tedarik ve stok yönetimi yetkilisi.' },
    { department: 'Üretim', role: 'uretici', email: 'uretici@videosat.com', password: 'test123', companyName: 'Üretim Firma Ltd.', firstName: 'Üretim', lastName: 'Koordinatörü', notes: 'Üretim planlama ve kontrol.' },
    { department: 'Toptan Satış', role: 'toptanci', email: 'toptanci@videosat.com', password: 'test123', companyName: 'Toptan Satış A.Ş.', firstName: 'Toptancı', lastName: 'Temsilcisi', notes: 'Toptancı paneli erişimi.' },
    { department: 'Perakende Satış', role: 'satici', email: 'satici@videosat.com', password: 'satici123', companyName: 'Perakende Satış Ltd.', firstName: 'Satış', lastName: 'Yetkilisi', notes: 'Satış noktası operasyonları.' },
    { department: 'Yönetim', role: 'yonetim', email: 'yonetim@videosat.com', password: 'yonetim123', companyName: 'VideoSat Yönetim Birimi', firstName: 'Yönetim', lastName: 'Koordinatörü', notes: 'Kurumsal yönetim ve karar destek.' },
    { department: 'Finans', role: 'finans', email: 'finans@videosat.com', password: 'finans123', companyName: 'VideoSat Finans Departmanı', firstName: 'Finans', lastName: 'Uzmanı', notes: 'Finansal raporlama ve kasa yönetimi.' },
    { department: 'Operasyon', role: 'operasyon', email: 'operasyon@videosat.com', password: 'operasyon123', companyName: 'VideoSat Operasyon Ekibi', firstName: 'Operasyon', lastName: 'Sorumlusu', notes: 'Operasyon koordinasyonu ve lojistik.' },
    { department: 'Müşteri Hizmetleri', role: 'musteri-hizmetleri', email: 'musterihizmetleri@videosat.com', password: 'musteri123', companyName: 'VideoSat Destek Merkezi', firstName: 'Müşteri', lastName: 'Temsilcisi', notes: 'Çağrı merkezi ve müşteri iletişimi.' },
    { department: 'İnsan Kaynakları', role: 'insan-kaynaklari', email: 'insankaynaklari@videosat.com', password: 'ik123456', companyName: 'VideoSat İnsan Kaynakları', firstName: 'İK', lastName: 'Uzmanı', notes: 'İK süreçleri ve işe alım.' },
    { department: 'Muhasebe', role: 'muhasebe', email: 'muhasebe@videosat.com', password: 'muhasebe123', companyName: 'VideoSat Muhasebe', firstName: 'Muhasebe', lastName: 'Yetkilisi', notes: 'Muhasebe kayıtları ve mali tablolar.' },
    { department: 'Faturalandırma', role: 'faturalandirma', email: 'faturalandirma@videosat.com', password: 'fatura123', companyName: 'VideoSat Faturalandırma', firstName: 'Faturalandırma', lastName: 'Uzmanı', notes: 'Faturalandırma süreçleri.' },
    { department: 'Personel Özlük İşleri', role: 'personel-ozluk-isleri', email: 'personelozluk@videosat.com', password: 'ozluk123', companyName: 'VideoSat Özlük İşleri', firstName: 'Özlük', lastName: 'Uzmanı', notes: 'Personel özlük dosyaları ve izin yönetimi.' },
    { department: 'Reklam', role: 'reklam', email: 'reklam@videosat.com', password: 'reklam123', companyName: 'VideoSat Reklam ve Pazarlama', firstName: 'Reklam', lastName: 'Yöneticisi', notes: 'Kampanya ve reklam yönetimi.' },
    { department: 'İş Geliştirme', role: 'is-gelistirme', email: 'isgelistirme@videosat.com', password: 'gelistirme123', companyName: 'VideoSat İş Geliştirme', firstName: 'İş', lastName: 'Geliştirme', notes: 'Stratejik iş geliştirme projeleri.' },
    { department: 'AR-GE', role: 'ar-ge', email: 'arge@videosat.com', password: 'arge12345', companyName: 'VideoSat AR-GE', firstName: 'AR-GE', lastName: 'Uzmanı', notes: 'Araştırma ve geliştirme çalışmaları.' },
    { department: 'Yazılım-Donanım-Güvenlik', role: 'yazilim-donanim-guvenlik', email: 'yazilimdonanimguvenlik@videosat.com', password: 'ydg12345', companyName: 'VideoSat Teknoloji ve Güvenlik', firstName: 'Teknoloji', lastName: 'Uzmanı', notes: 'Teknoloji, altyapı ve güvenlik operasyonları.' }
];

let currentSearchTerm = '';

window.addEventListener('DOMContentLoaded', () => {
    const adminUser = checkAdminAuth();
    if (adminUser) {
        updateAdminBanner(adminUser);
    }

    seedDepartmentUsers();
    initNavigation();
    renderSummaryCards();
    renderAuditTimeline();
    renderDepartmentUsers();
    renderProcedureCards();
    renderChecklists();
    renderDocumentation();
    bindActions();
});

function checkAdminAuth() {
    try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
            return {
                email: 'admin@videosat.com',
                firstName: 'Admin',
                role: 'admin'
            };
        }
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser?.role !== 'admin') {
            window.location.href = 'index.html';
            return null;
        }
        return currentUser;
    } catch (error) {
        console.warn('Admin auth kontrolü sırasında hata:', error);
        return {
            email: 'admin@videosat.com',
            firstName: 'Admin',
            role: 'admin'
        };
    }
}

function updateAdminBanner(user) {
    const adminName = document.getElementById('adminName');
    const adminMember = document.getElementById('adminMemberNumber');

    if (!adminName || !adminMember) return;

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    adminName.textContent = fullName || user.email || 'Admin';
    adminMember.textContent = user.email || 'admin@videosat.com';
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const section = link.getAttribute('data-section');
            if (!section) return;
            switchSection(section);
        });
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.panel-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });
}

function renderSummaryCards() {
    const container = document.getElementById('procedureSummary');
    if (!container) return;

    container.innerHTML = '';

    PROCEDURE_DATA.forEach(proc => {
        const status = STATUS_META[proc.status] || STATUS_META.review;
        const card = document.createElement('article');
        card.className = 'summary-card';
        card.innerHTML = `
            <div class="summary-card-header">
                <div class="summary-card-icon"><i class="fas ${proc.icon}"></i></div>
                <div>
                    <h3>${proc.title}</h3>
                    <p>${proc.summary}</p>
                </div>
            </div>
            <div class="summary-meta">
                <span><i class="fas fa-user-cog"></i>${proc.owner}</span>
                <span><i class="far fa-calendar-check"></i>Son denetim: ${formatDate(proc.lastAudit)}</span>
                <span><i class="far fa-calendar-plus"></i>Sonraki kontrol: ${formatDate(proc.nextReview)}</span>
            </div>
            <footer>
                <span class="${status.className}"><i class="fas ${status.icon}"></i>${status.label}</span>
                <a href="#procedures" class="card-action" data-view-procedure="${proc.id}"><i class="fas fa-arrow-right"></i> Detayları Gör</a>
            </footer>
        `;
        container.appendChild(card);
    });
}

function renderAuditTimeline() {
    const list = document.getElementById('auditTimeline');
    if (!list) return;

    const sorted = [...PROCEDURE_DATA].sort((a, b) => new Date(b.lastAudit) - new Date(a.lastAudit));

    list.innerHTML = sorted.map(proc => {
        const status = STATUS_META[proc.status] || STATUS_META.review;
        return `
            <li>
                <div class="timeline-title">${proc.title}</div>
                <div class="timeline-meta">
                    <span><i class="far fa-calendar-check"></i>${formatDate(proc.lastAudit)}</span>
                    <span><i class="fas fa-user"></i>${proc.owner}</span>
                    <span><i class="fas ${status.icon}"></i>${status.label}</span>
                </div>
                <p>${proc.auditNote}</p>
            </li>
        `;
    }).join('');
}

function renderDepartmentUsers() {
    const tbody = document.getElementById('departmentUserTable');
    if (!tbody) return;

    const storedUsers = getStoredUsers();
    const rows = DEPARTMENT_USERS.map(user => {
        const match = storedUsers.find((record) => (record.email || '').toLowerCase() === user.email.toLowerCase());
        const displayPassword = match?.password || match?.temporaryPassword || user.password;
        return {
            department: user.department,
            role: match?.role || user.role,
            email: match?.email || user.email,
            password: displayPassword,
            notes: user.notes
        };
    });

    tbody.innerHTML = rows.map(user => `
        <tr>
            <td>${escapeHtml(user.department)}</td>
            <td>${escapeHtml(user.role)}</td>
            <td>
                <div class="table-cell-copy">
                    <code>${escapeHtml(user.email)}</code>
                    <button type="button" class="copy-button" data-copy="${escapeHtml(user.email)}" data-copy-label="E-posta">
                        <i class="fas fa-copy"></i> Kopyala
                    </button>
                </div>
            </td>
            <td>
                <div class="table-cell-copy">
                    <div class="password-visibility" data-password="${escapeHtml(user.password)}" data-visible="false">
                        <span class="masked-password">${maskPassword(user.password)}</span>
                        <button type="button" class="password-visibility-toggle" data-password="${escapeHtml(user.password)}" aria-label="Şifreyi göster">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <button type="button" class="copy-button" data-copy="${escapeHtml(user.password)}" data-copy-label="Şifre">
                        <i class="fas fa-copy"></i> Kopyala
                    </button>
                </div>
            </td>
            <td>${escapeHtml(user.notes)}</td>
        </tr>
    `).join('');

    attachCopyHandlers();
    attachPasswordVisibilityHandlers();
}

function renderProcedureCards() {
    const container = document.getElementById('procedureList');
    if (!container) return;

    const filterTerm = currentSearchTerm.trim().toLowerCase();
    const filtered = PROCEDURE_DATA.filter(proc => {
        if (!filterTerm) return true;
        return [proc.title, proc.summary, proc.owner, ...(proc.tags || [])]
            .join(' ')
            .toLowerCase()
            .includes(filterTerm);
    });

    container.innerHTML = '';

    filtered.forEach(proc => {
        const card = document.createElement('article');
        card.className = 'procedure-card';
        card.id = `procedure-${proc.id}`;
        card.innerHTML = `
            <div class="procedure-header">
                <i class="fas ${proc.icon}"></i>
                <div>
                    <h3>${proc.title}</h3>
                    <span>${proc.owner}</span>
                </div>
            </div>
            <div class="procedure-body">
                <p>${proc.summary}</p>
                <div>
                    <h4>Adımlar</h4>
                    <ol>${proc.sentences.map(sentence => `<li>${sentence}</li>`).join('')}</ol>
                </div>
                <div>
                    <h4>Kontroller</h4>
                    <ul>${proc.controls.map(control => `<li>${control}</li>`).join('')}</ul>
                </div>
            </div>
            <div class="procedure-footer">
                <div class="procedure-tags">
                    ${(proc.tags || []).map(tag => `<span class="procedure-tag">${tag}</span>`).join('')}
                </div>
                <div class="procedure-links">
                    ${(proc.docs || []).map(doc => `<a class="card-action" href="${doc.href}" target="_blank" rel="noopener">${doc.label}</a>`).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (!filtered.length) {
        container.innerHTML = '<p>Arama kriterine uyan prosedür bulunamadı.</p>';
    }
}

function renderChecklists() {
    const container = document.getElementById('checklistContainer');
    if (!container) return;

    container.innerHTML = '';

    PROCEDURE_DATA.forEach(proc => {
        const card = document.createElement('div');
        card.className = 'checklist-card';
        card.innerHTML = `
            <div class="checklist-card-header">
                <h3><i class="fas ${proc.icon}"></i> ${proc.title}</h3>
                <span class="checklist-meta">Sonraki kontrol: ${formatDate(proc.nextReview)}</span>
            </div>
            <ul>
                ${proc.checklist.map((item, index) => `
                    <li>
                        <label>
                            <input type="checkbox" data-procedure="${proc.id}" data-index="${index}">
                            ${item}
                        </label>
                    </li>
                `).join('')}
            </ul>
        `;
        container.appendChild(card);
    });
}

function renderDocumentation() {
    const container = document.getElementById('documentationList');
    if (!container) return;

    const docMap = new Map();
    PROCEDURE_DATA.forEach(proc => {
        (proc.docs || []).forEach(doc => {
            if (!docMap.has(doc.href)) {
                docMap.set(doc.href, {
                    label: doc.label,
                    description: doc.description || proc.title,
                    procedures: new Set([proc.title])
                });
            } else {
                docMap.get(doc.href).procedures.add(proc.title);
            }
        });
    });

    container.innerHTML = '';

    Array.from(docMap.entries()).forEach(([href, meta]) => {
        const item = document.createElement('div');
        item.className = 'documentation-item';
        item.innerHTML = `
            <div>
                <h3>${meta.label}</h3>
                <p>${meta.description}</p>
                <p><strong>İlgili prosedürler:</strong> ${Array.from(meta.procedures).join(', ')}</p>
            </div>
            <a href="${href}" target="_blank" rel="noopener">
                <i class="fas fa-arrow-up-right-from-square"></i>
                Aç
            </a>
        `;
        container.appendChild(item);
    });
}

function bindActions() {
    document.querySelectorAll('[data-view-procedure]').forEach(link => {
        link.addEventListener('click', (event) => {
            const procedureId = event.currentTarget.getAttribute('data-view-procedure');
            switchSection('procedures');
            focusProcedureCard(procedureId);
        });
    });

    const searchInput = document.getElementById('procedureSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            currentSearchTerm = event.target.value;
            renderProcedureCards();
        });
    }

    const clearButton = document.getElementById('clearChecklist');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            document.querySelectorAll('#checklistContainer input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
        });
    }

    const exportButton = document.getElementById('exportSummary');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            console.table(PROCEDURE_DATA.map(proc => ({
                Prosedur: proc.title,
                Durum: STATUS_META[proc.status]?.label || 'Tanımsız',
                SonDenetim: formatDate(proc.lastAudit),
                SonrakiKontrol: formatDate(proc.nextReview)
            })));
            alert('Özet raporu CSV/PDF olarak dışa aktarma işlemi geliştirme listesine alındı. Şimdilik konsol tablosunu kullanabilirsiniz.');
        });
    }

    const refreshButton = document.getElementById('refreshSnapshot');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            renderAuditTimeline();
            renderSummaryCards();
            bindSummaryLinks();
            alert('Denetim özeti yenilendi. Planlanan manuel kontrolleri tamamladığınızdan emin olun.');
        });
    }

    const copyDirectoryBtn = document.getElementById('copyUserDirectory');
    if (copyDirectoryBtn) {
        copyDirectoryBtn.addEventListener('click', async () => {
            const original = copyDirectoryBtn.innerHTML;
            copyDirectoryBtn.disabled = true;
            const success = await copyToClipboard(getDepartmentUserTableText());
            if (success) {
                copyDirectoryBtn.innerHTML = '<i class="fas fa-check"></i> Kopyalandı';
                setTimeout(() => {
                    copyDirectoryBtn.innerHTML = original;
                    copyDirectoryBtn.disabled = false;
                }, 1600);
            } else {
                copyDirectoryBtn.disabled = false;
                alert('Kopyalama başarısız oldu. Lütfen bilgileri manuel olarak kopyalayın.');
            }
        });
    }

    const passwordToggle = document.getElementById('departmentPasswordVisibility');
    if (passwordToggle) {
        passwordToggle.addEventListener('change', () => {
            setDepartmentPasswordVisibility(passwordToggle.checked);
        });
    }

    attachCopyHandlers();
    attachPasswordVisibilityHandlers();

    bindSummaryLinks();
}

function bindSummaryLinks() {
    document.querySelectorAll('[data-view-procedure]').forEach(link => {
        if (!link.dataset.bound) {
            link.dataset.bound = 'true';
            link.addEventListener('click', (event) => {
                const procedureId = event.currentTarget.getAttribute('data-view-procedure');
                switchSection('procedures');
                focusProcedureCard(procedureId);
            });
        }
    });
}

function attachCopyHandlers() {
    document.querySelectorAll('[data-copy]').forEach(button => {
        if (button.dataset.copyBound === 'true') {
            return;
        }

        button.dataset.copyBound = 'true';
        button.addEventListener('click', async () => {
            const value = button.getAttribute('data-copy') || '';
            if (!value) return;

            const originalLabel = button.innerHTML;
            button.disabled = true;

            const success = await copyToClipboard(value);
            if (success) {
                button.innerHTML = '<i class="fas fa-check"></i> Kopyalandı';
                setTimeout(() => {
                    button.innerHTML = originalLabel;
                    button.disabled = false;
                }, 1500);
            } else {
                button.disabled = false;
                alert('Kopyalama başarısız oldu. Lütfen değerleri manuel olarak kopyalayın.');
            }
        });
    });
}

function attachPasswordVisibilityHandlers() {
    document.querySelectorAll('.password-visibility-toggle').forEach((button) => {
        if (button.dataset.bound === 'true') {
            return;
        }

        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            const container = button.closest('.password-visibility');
            if (!container) return;

            const span = container.querySelector('.masked-password');
            if (!span) return;

            const password = button.getAttribute('data-password') || container.getAttribute('data-password') || '';
            const isVisible = container.getAttribute('data-visible') === 'true';

            if (isVisible) {
                span.textContent = maskPassword(password);
                container.setAttribute('data-visible', 'false');
                button.innerHTML = '<i class="fas fa-eye"></i>';
                button.setAttribute('aria-label', 'Şifreyi göster');
            } else {
                span.textContent = password;
                container.setAttribute('data-visible', 'true');
                button.innerHTML = '<i class="fas fa-eye-slash"></i>';
                button.setAttribute('aria-label', 'Şifreyi gizle');
            }
        });
    });
}

function getDepartmentUserTableText() {
    const header = ['Departman', 'Rol', 'E-posta', 'Varsayılan Şifre', 'Not'];
    const storedUsers = getStoredUsers();
    const rows = DEPARTMENT_USERS.map(user => {
        const stored = storedUsers.find((record) => (record.email || '').toLowerCase() === user.email.toLowerCase());
        return [
            user.department,
            stored?.role || user.role,
            stored?.email || user.email,
            stored?.password || stored?.temporaryPassword || user.password,
            user.notes
        ].join('\t');
    });
    return [header.join('\t'), ...rows].join('\n');
}

async function copyToClipboard(text) {
    if (!text) return false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Clipboard API yazma hatası:', error);
        }
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textarea);
        return result;
    } catch (error) {
        console.warn('execCommand ile kopyalama başarısız:', error);
        return false;
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function maskPassword(value) {
    const length = (value || '').length;
    if (!length) {
        return '••••••••';
    }
    const repeat = Math.max(8, Math.min(length, 12));
    return '•'.repeat(repeat);
}

function setDepartmentPasswordVisibility(visible) {
    document.querySelectorAll('.password-visibility').forEach(container => {
        const button = container.querySelector('.password-visibility-toggle');
        const span = container.querySelector('.masked-password');
        if (!button || !span) return;

        const password = button.getAttribute('data-password') || container.getAttribute('data-password') || '';
        if (visible) {
            span.textContent = password;
            container.setAttribute('data-visible', 'true');
            button.innerHTML = '<i class="fas fa-eye-slash"></i>';
            button.setAttribute('aria-label', 'Şifreyi gizle');
        } else {
            span.textContent = maskPassword(password);
            container.setAttribute('data-visible', 'false');
            button.innerHTML = '<i class="fas fa-eye"></i>';
            button.setAttribute('aria-label', 'Şifreyi göster');
        }
    });
}

function getStoredUsers() {
    try {
        const usersStr = localStorage.getItem('users');
        const users = usersStr ? JSON.parse(usersStr) : [];
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.warn('Stored users parse failure:', error);
        return [];
    }
}

function saveStoredUsers(users) {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.warn('Stored users persist failure:', error);
    }
}

function seedDepartmentUsers() {
    const users = getStoredUsers();
    const map = new Map(users.map(user => [(user.email || '').toLowerCase(), user]));
    let updated = false;

    DEPARTMENT_USERS.forEach((user) => {
        const key = user.email.toLowerCase();
        const existing = map.get(key);

        if (!existing) {
            const seedUser = {
                id: `seed-${key}`,
                email: user.email,
                password: user.password,
                role: user.role,
                companyName: user.department,
                firstName: user.department,
                lastName: 'Kullanıcısı',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                mustChangePassword: true
            };
            users.push(seedUser);
            map.set(key, seedUser);
            updated = true;
        } else {
            let mutated = false;
            if (!existing.role && user.role) {
                existing.role = user.role;
                mutated = true;
            }
            if (!existing.companyName) {
                existing.companyName = user.department;
                mutated = true;
            }
            if (!existing.password && user.password) {
                existing.password = user.password;
                mutated = true;
            }
            if (mutated) {
                updated = true;
            }
        }
    });

    if (updated) {
        saveStoredUsers(users);
    }
}

function focusProcedureCard(id) {
    if (!id) return;
    const card = document.getElementById(`procedure-${id}`);
    if (!card) return;
    card.classList.add('focus');
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => card.classList.remove('focus'), 1600);
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function logout() {
    try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('videosat_user');
        localStorage.removeItem('videosat_token');
        localStorage.removeItem('videosat_refresh_token');
    } catch (error) {
        console.warn('Oturum kapatma sırasında hata:', error);
    }
    window.location.href = 'index.html';
}

window.logout = logout;

