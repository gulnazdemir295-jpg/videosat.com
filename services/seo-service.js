/**
 * SEO Service - Search Engine Optimization
 * Meta tags, structured data, Open Graph, Twitter Cards
 */

class SEOService {
    constructor() {
        this.defaultMeta = {
            title: 'VideoSat - E-Ticaret Canlı Yayın Platformu',
            description: 'VideoSat ile e-ticaret ve canlı yayın yapın. Ürünlerinizi canlı yayında tanıtın, satışlarınızı artırın.',
            keywords: 'e-ticaret, canlı yayın, video satış, online satış, live streaming, e-commerce',
            author: 'VideoSat',
            image: 'https://basvideo.com/og-image.jpg',
            url: 'https://basvideo.com',
            siteName: 'VideoSat',
            locale: 'tr_TR',
            type: 'website'
        };
        
        this.init();
    }

    /**
     * Initialize SEO Service
     */
    init() {
        // Set default meta tags
        this.setMetaTags(this.defaultMeta);
        
        // Add structured data
        this.addStructuredData();
        
        // Add Open Graph tags
        this.addOpenGraphTags(this.defaultMeta);
        
        // Add Twitter Card tags
        this.addTwitterCardTags(this.defaultMeta);
        
        console.log('✅ SEO Service initialized');
    }

    /**
     * Set meta tags
     */
    setMetaTags(meta) {
        // Title
        if (meta.title) {
            document.title = meta.title;
            this.setMetaTag('title', meta.title);
        }
        
        // Description
        if (meta.description) {
            this.setMetaTag('description', meta.description);
        }
        
        // Keywords
        if (meta.keywords) {
            this.setMetaTag('keywords', meta.keywords);
        }
        
        // Author
        if (meta.author) {
            this.setMetaTag('author', meta.author);
        }
        
        // Robots
        this.setMetaTag('robots', meta.robots || 'index, follow');
        
        // Viewport (already set in HTML)
        // this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }

    /**
     * Set or update meta tag
     */
    setMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    /**
     * Set Open Graph meta tags
     */
    addOpenGraphTags(meta) {
        const ogTags = {
            'og:title': meta.title || this.defaultMeta.title,
            'og:description': meta.description || this.defaultMeta.description,
            'og:image': meta.image || this.defaultMeta.image,
            'og:url': meta.url || this.defaultMeta.url,
            'og:type': meta.type || this.defaultMeta.type,
            'og:site_name': meta.siteName || this.defaultMeta.siteName,
            'og:locale': meta.locale || this.defaultMeta.locale
        };
        
        Object.entries(ogTags).forEach(([property, content]) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            
            meta.setAttribute('content', content);
        });
    }

    /**
     * Set Twitter Card meta tags
     */
    addTwitterCardTags(meta) {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': meta.title || this.defaultMeta.title,
            'twitter:description': meta.description || this.defaultMeta.description,
            'twitter:image': meta.image || this.defaultMeta.image,
            'twitter:site': '@videosat',
            'twitter:creator': '@videosat'
        };
        
        Object.entries(twitterTags).forEach(([name, content]) => {
            let metaTag = document.querySelector(`meta[name="${name}"]`);
            
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('name', name);
                document.head.appendChild(metaTag);
            }
            
            metaTag.setAttribute('content', content);
        });
    }

    /**
     * Add structured data (JSON-LD)
     */
    addStructuredData() {
        // Organization Schema
        const organizationSchema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'VideoSat',
            'url': 'https://basvideo.com',
            'logo': 'https://basvideo.com/logo.png',
            'description': 'E-ticaret ve canlı yayın platformu',
            'sameAs': [
                'https://twitter.com/videosat',
                'https://facebook.com/videosat',
                'https://instagram.com/videosat'
            ],
            'contactPoint': {
                '@type': 'ContactPoint',
                'telephone': '+90-555-000-0000',
                'contactType': 'customer service',
                'areaServed': 'TR',
                'availableLanguage': ['tr', 'en']
            }
        };
        
        // Website Schema
        const websiteSchema = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'VideoSat',
            'url': 'https://basvideo.com',
            'potentialAction': {
                '@type': 'SearchAction',
                'target': 'https://basvideo.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
            }
        };
        
        // BreadcrumbList Schema (for navigation)
        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Ana Sayfa',
                    'item': 'https://basvideo.com/'
                }
            ]
        };
        
        // Add schemas to page
        this.addJSONLD(organizationSchema);
        this.addJSONLD(websiteSchema);
        this.addJSONLD(breadcrumbSchema);
    }

    /**
     * Add JSON-LD structured data
     */
    addJSONLD(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    /**
     * Update page SEO for specific page
     */
    updatePageSEO(pageMeta) {
        const meta = {
            ...this.defaultMeta,
            ...pageMeta
        };
        
        this.setMetaTags(meta);
        this.addOpenGraphTags(meta);
        this.addTwitterCardTags(meta);
        
        // Update structured data if needed
        if (pageMeta.structuredData) {
            this.addJSONLD(pageMeta.structuredData);
        }
    }

    /**
     * Add product structured data
     */
    addProductSchema(product) {
        const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': product.name,
            'description': product.description,
            'image': product.image || this.defaultMeta.image,
            'brand': {
                '@type': 'Brand',
                'name': 'VideoSat'
            },
            'offers': {
                '@type': 'Offer',
                'url': `https://basvideo.com/products/${product.id}`,
                'priceCurrency': 'TRY',
                'price': product.price,
                'availability': product.stock > 0 
                    ? 'https://schema.org/InStock' 
                    : 'https://schema.org/OutOfStock',
                'seller': {
                    '@type': 'Organization',
                    'name': 'VideoSat'
                }
            }
        };
        
        this.addJSONLD(productSchema);
    }

    /**
     * Add video structured data (for live stream)
     */
    addVideoSchema(video) {
        const videoSchema = {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            'name': video.name || 'Canlı Yayın',
            'description': video.description || 'VideoSat canlı yayın',
            'thumbnailUrl': video.thumbnail || this.defaultMeta.image,
            'uploadDate': video.uploadDate || new Date().toISOString(),
            'duration': video.duration || 'PT1H',
            'contentUrl': video.url || 'https://basvideo.com/live-stream.html',
            'embedUrl': video.embedUrl || 'https://basvideo.com/live-stream.html'
        };
        
        this.addJSONLD(videoSchema);
    }

    /**
     * Add breadcrumb
     */
    addBreadcrumb(items) {
        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': items.map((item, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'name': item.name,
                'item': item.url
            }))
        };
        
        this.addJSONLD(breadcrumbSchema);
    }

    /**
     * Generate canonical URL
     */
    setCanonicalURL(url) {
        let link = document.querySelector('link[rel="canonical"]');
        
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        
        link.setAttribute('href', url);
    }

    /**
     * Add alternate language links
     */
    addAlternateLanguages(languages) {
        languages.forEach(lang => {
            const link = document.createElement('link');
            link.setAttribute('rel', 'alternate');
            link.setAttribute('hreflang', lang.code);
            link.setAttribute('href', lang.url);
            document.head.appendChild(link);
        });
    }
}

// Export
const seoService = new SEOService();
window.seoService = seoService;

console.log('✅ SEO Service initialized');

