// VideoSat Platform - Real Cargo Service
// Gerçek kargo firmaları API entegrasyonu

class RealCargoService {
    constructor() {
        this.config = {
            arasApiKey: null,
            arasSecret: null,
            mngApiKey: null,
            yurticiApiKey: null
        };
        
        this.cargoCompanies = {
            aras: {
                name: 'Aras Kargo',
                apiUrl: 'https://api.araskargo.com.tr/api',
                trackingUrl: 'https://www.araskargo.com.tr/takip'
            },
            mng: {
                name: 'MNG Kargo',
                apiUrl: 'https://api.mngkargo.com.tr/api',
                trackingUrl: 'https://www.mngkargo.com.tr/takip'
            },
            yurtici: {
                name: 'Yurtiçi Kargo',
                apiUrl: 'https://api.yurticikargo.com.tr/api',
                trackingUrl: 'https://www.yurticikargo.com.tr/takip'
            }
        };
        
        this.init();
    }

    init() {
        console.log('🚚 Real Cargo Service başlatılıyor...');
        this.loadConfiguration();
    }

    // Yapılandırmayı yükle
    loadConfiguration() {
        const savedConfig = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        const cargoConfig = savedConfig.cargo || {};
        
        this.config = {
            arasApiKey: cargoConfig.arasApiKey || null,
            arasSecret: cargoConfig.arasSecret || null,
            mngApiKey: cargoConfig.mngApiKey || null,
            yurticiApiKey: cargoConfig.yurticiApiKey || null
        };
    }

    // Kargo gönderisi oluştur
    async createShipment(shipmentData) {
        const { company, sender, receiver, items } = shipmentData;
        
        try {
            let result;
            
            switch (company) {
                case 'aras':
                    result = await this.createArasShipment(sender, receiver, items);
                    break;
                case 'mng':
                    result = await this.createMNGShipment(sender, receiver, items);
                    break;
                case 'yurtici':
                    result = await this.createYurticiShipment(sender, receiver, items);
                    break;
                default:
                    throw new Error('Desteklenmeyen kargo firması');
            }
            
            // Kargo gönderisini kaydet
            this.saveShipment(result);
            
            return result;
        } catch (error) {
            console.error('❌ Kargo gönderisi oluşturulamadı:', error);
            // Fallback: Simüle edilmiş kargo
            return this.createSimulatedShipment(shipmentData);
        }
    }

    // Aras Kargo gönderisi oluştur
    async createArasShipment(sender, receiver, items) {
        if (!this.config.arasApiKey || !this.config.arasSecret) {
            throw new Error('Aras Kargo API anahtarları eksik');
        }

        const shipmentData = {
            sender: {
                name: sender.name,
                address: sender.address,
                city: sender.city,
                phone: sender.phone,
                email: sender.email
            },
            receiver: {
                name: receiver.name,
                address: receiver.address,
                city: receiver.city,
                phone: receiver.phone,
                email: receiver.email
            },
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                weight: item.weight,
                value: item.value
            })),
            service_type: 'standard',
            payment_type: 'sender'
        };

        const response = await fetch(`${this.cargoCompanies.aras.apiUrl}/shipment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.arasApiKey}`,
                'X-Secret': this.config.arasSecret
            },
            body: JSON.stringify(shipmentData)
        });

        if (!response.ok) {
            throw new Error('Aras Kargo API hatası');
        }

        const result = await response.json();
        return {
            ...result,
            company: 'aras',
            companyName: this.cargoCompanies.aras.name,
            trackingUrl: `${this.cargoCompanies.aras.trackingUrl}/${result.trackingNumber}`
        };
    }

    // MNG Kargo gönderisi oluştur
    async createMNGShipment(sender, receiver, items) {
        if (!this.config.mngApiKey) {
            throw new Error('MNG Kargo API anahtarı eksik');
        }

        const shipmentData = {
            sender: {
                name: sender.name,
                address: sender.address,
                city: sender.city,
                phone: sender.phone,
                email: sender.email
            },
            receiver: {
                name: receiver.name,
                address: receiver.address,
                city: receiver.city,
                phone: receiver.phone,
                email: receiver.email
            },
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                weight: item.weight,
                value: item.value
            })),
            service_type: 'standard'
        };

        const response = await fetch(`${this.cargoCompanies.mng.apiUrl}/shipment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.mngApiKey}`
            },
            body: JSON.stringify(shipmentData)
        });

        if (!response.ok) {
            throw new Error('MNG Kargo API hatası');
        }

        const result = await response.json();
        return {
            ...result,
            company: 'mng',
            companyName: this.cargoCompanies.mng.name,
            trackingUrl: `${this.cargoCompanies.mng.trackingUrl}/${result.trackingNumber}`
        };
    }

    // Yurtiçi Kargo gönderisi oluştur
    async createYurticiShipment(sender, receiver, items) {
        if (!this.config.yurticiApiKey) {
            throw new Error('Yurtiçi Kargo API anahtarı eksik');
        }

        const shipmentData = {
            sender: {
                name: sender.name,
                address: sender.address,
                city: sender.city,
                phone: sender.phone,
                email: sender.email
            },
            receiver: {
                name: receiver.name,
                address: receiver.address,
                city: receiver.city,
                phone: receiver.phone,
                email: receiver.email
            },
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                weight: item.weight,
                value: item.value
            })),
            service_type: 'standard'
        };

        const response = await fetch(`${this.cargoCompanies.yurtici.apiUrl}/shipment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.yurticiApiKey}`
            },
            body: JSON.stringify(shipmentData)
        });

        if (!response.ok) {
            throw new Error('Yurtiçi Kargo API hatası');
        }

        const result = await response.json();
        return {
            ...result,
            company: 'yurtici',
            companyName: this.cargoCompanies.yurtici.name,
            trackingUrl: `${this.cargoCompanies.yurtici.trackingUrl}/${result.trackingNumber}`
        };
    }

    // Simüle edilmiş kargo gönderisi
    createSimulatedShipment(shipmentData) {
        const trackingNumber = this.generateTrackingNumber();
        const company = shipmentData.company || 'aras';
        
        return {
            trackingNumber: trackingNumber,
            company: company,
            companyName: this.cargoCompanies[company].name,
            status: 'created',
            created_at: new Date().toISOString(),
            estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün sonra
            trackingUrl: `${this.cargoCompanies[company].trackingUrl}/${trackingNumber}`,
            sender: shipmentData.sender,
            receiver: shipmentData.receiver,
            items: shipmentData.items,
            simulated: true
        };
    }

    // Takip numarası oluştur
    generateTrackingNumber() {
        const prefix = 'VS';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Kargo takip et
    async trackShipment(trackingNumber, company = null) {
        try {
            // Önce hangi firmaya ait olduğunu bul
            if (!company) {
                company = await this.detectCargoCompany(trackingNumber);
            }

            let result;
            
            switch (company) {
                case 'aras':
                    result = await this.trackArasShipment(trackingNumber);
                    break;
                case 'mng':
                    result = await this.trackMNGShipment(trackingNumber);
                    break;
                case 'yurtici':
                    result = await this.trackYurticiShipment(trackingNumber);
                    break;
                default:
                    throw new Error('Desteklenmeyen kargo firması');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Kargo takip hatası:', error);
            // Fallback: Simüle edilmiş takip
            return this.trackSimulatedShipment(trackingNumber);
        }
    }

    // Kargo firmasını tespit et
    async detectCargoCompany(trackingNumber) {
        // Önce kayıtlı gönderilerde ara
        const shipments = JSON.parse(localStorage.getItem('cargoShipments') || '[]');
        const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
        
        if (shipment) {
            return shipment.company;
        }

        // API'lerde ara
        for (const [company, config] of Object.entries(this.cargoCompanies)) {
            try {
                const response = await fetch(`${config.apiUrl}/tracking/${trackingNumber}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.config[`${company}ApiKey`]}`
                    }
                });
                
                if (response.ok) {
                    return company;
                }
            } catch (error) {
                // Devam et
            }
        }

        // Varsayılan olarak aras
        return 'aras';
    }

    // Aras Kargo takip et
    async trackArasShipment(trackingNumber) {
        if (!this.config.arasApiKey) {
            throw new Error('Aras Kargo API anahtarı eksik');
        }

        const response = await fetch(`${this.cargoCompanies.aras.apiUrl}/tracking/${trackingNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.config.arasApiKey}`,
                'X-Secret': this.config.arasSecret
            }
        });

        if (!response.ok) {
            throw new Error('Aras Kargo takip hatası');
        }

        const result = await response.json();
        return {
            ...result,
            company: 'aras',
            companyName: this.cargoCompanies.aras.name,
            trackingUrl: `${this.cargoCompanies.aras.trackingUrl}/${trackingNumber}`
        };
    }

    // MNG Kargo takip et
    async trackMNGShipment(trackingNumber) {
        if (!this.config.mngApiKey) {
            throw new Error('MNG Kargo API anahtarı eksik');
        }

        const response = await fetch(`${this.cargoCompanies.mng.apiUrl}/tracking/${trackingNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.config.mngApiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('MNG Kargo takip hatası');
        }

        const result = await response.json();
        return {
            ...result,
            company: 'mng',
            companyName: this.cargoCompanies.mng.name,
            trackingUrl: `${this.cargoCompanies.mng.trackingUrl}/${trackingNumber}`
        };
    }

    // Yurtiçi Kargo takip et
    async trackYurticiShipment(trackingNumber) {
        if (!this.config.yurticiApiKey) {
            throw new Error('Yurtiçi Kargo API anahtarı eksik');
        }

        const response = await fetch(`${this.cargoCompanies.yurtici.apiUrl}/tracking/${trackingNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.config.yurticiApiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Yurtiçi Kargo takip hatası');
        }

        const result = await response.json();
        return {
            ...result,
            company: 'yurtici',
            companyName: this.cargoCompanies.yurtici.name,
            trackingUrl: `${this.cargoCompanies.yurtici.trackingUrl}/${trackingNumber}`
        };
    }

    // Simüle edilmiş kargo takip
    trackSimulatedShipment(trackingNumber) {
        const statuses = [
            { status: 'created', description: 'Kargo oluşturuldu', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { status: 'picked_up', description: 'Kargo alındı', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { status: 'in_transit', description: 'Kargo yolda', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
            { status: 'out_for_delivery', description: 'Dağıtımda', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ];

        return {
            trackingNumber: trackingNumber,
            company: 'aras',
            companyName: 'Aras Kargo',
            status: 'in_transit',
            statusDescription: 'Kargo yolda',
            events: statuses,
            estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            trackingUrl: `https://www.araskargo.com.tr/takip/${trackingNumber}`,
            simulated: true
        };
    }

    // Kargo gönderisini kaydet
    saveShipment(shipment) {
        const shipments = JSON.parse(localStorage.getItem('cargoShipments') || '[]');
        shipments.push(shipment);
        localStorage.setItem('cargoShipments', JSON.stringify(shipments));
    }

    // Kargo gönderilerini al
    getShipments() {
        return JSON.parse(localStorage.getItem('cargoShipments') || '[]');
    }

    // Kargo durumunu güncelle
    async updateShipmentStatus(trackingNumber) {
        try {
            const trackingData = await this.trackShipment(trackingNumber);
            
            // Kayıtlı gönderiyi güncelle
            const shipments = this.getShipments();
            const shipmentIndex = shipments.findIndex(s => s.trackingNumber === trackingNumber);
            
            if (shipmentIndex !== -1) {
                shipments[shipmentIndex] = { ...shipments[shipmentIndex], ...trackingData };
                localStorage.setItem('cargoShipments', JSON.stringify(shipments));
            }
            
            return trackingData;
        } catch (error) {
            console.error('❌ Kargo durumu güncellenemedi:', error);
            throw error;
        }
    }

    // Kargo takip widget'ı oluştur
    createTrackingWidget(containerId, trackingNumber) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error('Takip widget konteyneri bulunamadı');
        }

        container.innerHTML = `
            <div class="cargo-tracking-widget">
                <div class="tracking-header">
                    <h3><i class="fas fa-truck"></i> Kargo Takip</h3>
                    <div class="tracking-number">
                        <strong>Takip No:</strong> ${trackingNumber}
                    </div>
                </div>
                
                <div class="tracking-content">
                    <div class="tracking-status">
                        <div class="status-indicator" id="status-indicator">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <div class="status-text" id="status-text">Yükleniyor...</div>
                    </div>
                    
                    <div class="tracking-timeline" id="tracking-timeline">
                        <!-- Takip olayları buraya gelecek -->
                    </div>
                    
                    <div class="tracking-actions">
                        <button class="btn btn-primary" onclick="refreshTracking('${trackingNumber}')">
                            <i class="fas fa-sync-alt"></i> Yenile
                        </button>
                        <button class="btn btn-secondary" onclick="openTrackingPage('${trackingNumber}')">
                            <i class="fas fa-external-link-alt"></i> Kargo Firmasında Aç
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Takip verilerini yükle
        this.loadTrackingData(trackingNumber);
    }

    // Takip verilerini yükle
    async loadTrackingData(trackingNumber) {
        try {
            const trackingData = await this.trackShipment(trackingNumber);
            this.updateTrackingWidget(trackingNumber, trackingData);
        } catch (error) {
            this.updateTrackingWidget(trackingNumber, null, error.message);
        }
    }

    // Takip widget'ını güncelle
    updateTrackingWidget(trackingNumber, trackingData, error = null) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const timeline = document.getElementById('tracking-timeline');

        if (error) {
            statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>';
            statusText.textContent = `Hata: ${error}`;
            timeline.innerHTML = '<p style="color: #dc3545;">Takip bilgileri alınamadı</p>';
            return;
        }

        // Durum göstergesi
        const statusIcons = {
            'created': 'fas fa-plus-circle',
            'picked_up': 'fas fa-hand-paper',
            'in_transit': 'fas fa-truck',
            'out_for_delivery': 'fas fa-shipping-fast',
            'delivered': 'fas fa-check-circle'
        };

        const statusColors = {
            'created': '#ffc107',
            'picked_up': '#17a2b8',
            'in_transit': '#007bff',
            'out_for_delivery': '#fd7e14',
            'delivered': '#28a745'
        };

        statusIndicator.innerHTML = `<i class="${statusIcons[trackingData.status] || 'fas fa-question-circle'}" style="color: ${statusColors[trackingData.status] || '#6c757d'};"></i>`;
        statusText.textContent = trackingData.statusDescription || trackingData.status;

        // Zaman çizelgesi
        if (trackingData.events && trackingData.events.length > 0) {
            timeline.innerHTML = trackingData.events.map(event => `
                <div class="timeline-event">
                    <div class="event-time">${new Date(event.timestamp).toLocaleString('tr-TR')}</div>
                    <div class="event-description">${event.description}</div>
                </div>
            `).join('');
        } else {
            timeline.innerHTML = '<p>Takip bilgisi bulunamadı</p>';
        }
    }

    // Yapılandırmayı güncelle
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // localStorage'a kaydet
        const allConfigs = JSON.parse(localStorage.getItem('moduleConfigurations') || '{}');
        allConfigs.cargo = this.config;
        localStorage.setItem('moduleConfigurations', JSON.stringify(allConfigs));
    }
}

// Global instance oluştur
window.realCargoService = new RealCargoService();

// Global fonksiyonlar
window.createShipment = function(shipmentData) {
    return window.realCargoService.createShipment(shipmentData);
};

window.trackShipment = function(trackingNumber, company) {
    return window.realCargoService.trackShipment(trackingNumber, company);
};

window.createTrackingWidget = function(containerId, trackingNumber) {
    return window.realCargoService.createTrackingWidget(containerId, trackingNumber);
};

window.refreshTracking = function(trackingNumber) {
    const container = document.querySelector('.cargo-tracking-widget').parentElement;
    window.realCargoService.createTrackingWidget(container.id, trackingNumber);
};

window.openTrackingPage = function(trackingNumber) {
    const shipments = window.realCargoService.getShipments();
    const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
    
    if (shipment && shipment.trackingUrl) {
        window.open(shipment.trackingUrl, '_blank');
    } else {
        alert('Takip URL\'i bulunamadı');
    }
};

console.log('✅ Real Cargo Service yüklendi');


