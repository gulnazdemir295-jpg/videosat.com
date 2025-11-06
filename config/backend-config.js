/**
 * Merkezi Backend Yapılandırma
 * Tüm port ve URL yapılandırmaları buradan yönetilir
 */

// Backend Port (tüm sistemde tutarlı olmalı)
const DEFAULT_BACKEND_PORT = 3000;

// Production ve Development ortamları
// Frontend'de process.env yok, window.location kullan
const isProduction = (typeof window !== 'undefined' && window.location.hostname === 'basvideo.com') || 
                     (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');
const isDevelopment = !isProduction;

// Backend URL yapılandırması
const getBackendConfig = () => {
  // Frontend'de process.env yok, backend'de var
  const port = (typeof process !== 'undefined' && process.env && process.env.PORT) 
               ? process.env.PORT 
               : DEFAULT_BACKEND_PORT;
  const hostname = (typeof process !== 'undefined' && process.env && process.env.HOSTNAME)
                   ? process.env.HOSTNAME
                   : 'localhost';
  const protocol = isProduction ? 'https' : 'http';
  
  // Production domain
  const productionDomain = 'basvideo.com';
  
  // Development
  const devBaseURL = `http://localhost:${port}`;
  const devAPIURL = `${devBaseURL}/api`;
  
  // Production
  const prodBaseURL = `https://${productionDomain}`;
  const prodAPIURL = `${prodBaseURL}/api`;
  
  return {
    port: parseInt(port, 10),
    hostname,
    protocol,
    productionDomain,
    // Base URLs
    baseURL: isProduction ? prodBaseURL : devBaseURL,
    apiURL: isProduction ? prodAPIURL : devAPIURL,
    // Environment
    isProduction,
    isDevelopment,
    // Default port (validation için)
    defaultPort: DEFAULT_BACKEND_PORT
  };
};

// Frontend için (browser environment)
if (typeof window !== 'undefined') {
  window.BACKEND_CONFIG = getBackendConfig();
  
  // Frontend getAPIBaseURL fonksiyonu
  window.getAPIBaseURL = function() {
    const hostname = window.location.hostname;
    const config = window.BACKEND_CONFIG || getBackendConfig();
    
    // Production - Nginx ile backend api.basvideo.com'da
    if (hostname === config.productionDomain || hostname.includes(config.productionDomain)) {
      return config.productionDomain.includes('basvideo.com') 
        ? 'https://api.basvideo.com/api'  // Nginx backend URL
        : `${config.protocol}://api.${config.productionDomain}/api`;
    }
    
    // Development - Port'u config'den al
    const port = config.port || config.defaultPort;
    return `http://localhost:${port}/api`;
  };
}

// Backend için (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getBackendConfig,
    DEFAULT_BACKEND_PORT,
    // Backend port validation
    validatePort: (port) => {
      const portNum = parseInt(port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        throw new Error(`Geçersiz port: ${port}. Port 1-65535 arasında olmalı.`);
      }
      return portNum;
    },
    // Port çakışması kontrolü (Node.js için)
    checkPortAvailable: async (port) => {
      if (typeof require === 'undefined') return true;
      const net = require('net');
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.once('close', () => resolve(true));
          server.close();
        });
        server.on('error', () => resolve(false));
      });
    }
  };
}

// Global export (browser için)
if (typeof window !== 'undefined') {
  window.DEFAULT_BACKEND_PORT = DEFAULT_BACKEND_PORT;
}

