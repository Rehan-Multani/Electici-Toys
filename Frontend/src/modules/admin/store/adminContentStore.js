import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

const defaultContent = {
    homePage: {
        hero: {
            image: '/assets/products/WhatsApp Image 2026-01-10 at 16.10.54.jpeg',
            images: [
                '/assets/products/WhatsApp Image 2026-01-10 at 16.10.54.jpeg',
            ],
            heading: 'UNLEASH THE POWER OF PLAY.',
            subheading: '',
            ctaText: 'SHOP COLLECTION',
            ctaLink: '/products'
        },
        trustMarkers: [
            {
                id: 1,
                icon: 'Shield',
                title: '1-YEAR WARRANTY',
                description: 'Full peace of mind'
            },
            {
                id: 2,
                icon: 'Truck',
                title: 'EXPRESS SHIPPING',
                description: 'Same day dispatch'
            },
            {
                id: 3,
                icon: 'CreditCard',
                title: 'GST INVOICE',
                description: 'Business ready'
            },
            {
                id: 4,
                icon: 'RotateCcw',
                title: 'EASY RETURNS',
                description: '7-day policy'
            }
        ],
        featuredSection: {
            title: 'THE HIT LIST',
            subtitle: 'Our most-wanted electric wonders.',
            ctaText: 'All Products',
            ctaLink: '/products'
        },
        categories: [], // Should be dynamic from backend
        specialOffers: {
            title: 'SPECIAL OFFERS',
            offerSets: [
                {
                    id: 1,
                    images: ['/assets/advertisment/1.png', '/assets/advertisment/3.png', '/assets/advertisment/2.png']
                },
                {
                    id: 2,
                    images: ['/assets/advertisment/4.png', '/assets/advertisment/5.png', '/assets/advertisment/6.png']
                },
                {
                    id: 3,
                    images: ['/assets/advertisment/7.png', '/assets/advertisment/8.png', '/assets/advertisment/4.png']
                }
            ]
        }
    },
    aboutPage: {
        hero: {
            heading: '',
            mission: ''
        },
        images: [
            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.39.jpeg",
            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.33.jpeg",
            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.22.jpeg",
            "/assets/products/WhatsApp Image 2026-01-10 at 16.11.14.jpeg"
        ],
        values: [],
        content: {
            heading: '',
            paragraphs: [],
            emoji: ''
        }
    },
    contactPage: {
        header: {
            title: 'GET IN TOUCH',
            subtitle: 'Have questions about our electric wonders? Our team is here to help you gear up.'
        },
        contactInfo: {
            email: 'support@electricitoys.com',
            phone: '+91 98765 43210',
            address: '123 Electric Avenue, Cyber City, Bangalore - 560001'
        },
        supportHours: {
            schedule: 'Monday — Friday: 9am — 6pm\nSaturday: 10am — 4pm',
            liveStatus: true,
            liveText: 'LIVE SUPPORT ACTIVE NOW'
        },
        formLabels: {
            nameLabel: 'Full Name',
            namePlaceholder: 'JOHNNY DRIFT',
            emailLabel: 'Email Address',
            emailPlaceholder: 'HELLO@SPEED.COM',
            messageLabel: 'Message',
            messagePlaceholder: 'TELL US ABOUT YOUR QUERY...',
            submitText: 'SEND TRANSMISSION'
        }
    },
    experiencePage: {
        // Mobile scroll overlays
        mobileScrolls: [
            {
                id: 1,
                start: 0,
                end: 0.15,
                align: 'center',
                heading: 'Electrici-Toys.',
                description: ''
            },
            {
                id: 2,
                start: 0.18,
                end: 0.32,
                align: 'center',
                heading: 'Precision Engineering.',
                description: 'Maximum performance and durability.'
            },
            {
                id: 3,
                start: 0.35,
                end: 0.5,
                align: 'center',
                heading: 'Ultra-High Quality.',
                description: 'Built to last a lifetime.'
            },
            {
                id: 4,
                start: 0.55,
                end: 0.65,
                align: 'center',
                heading: 'Exciting Toys.',
                description: '',
                ctaText: 'SHOP NOW',
                ctaLink: '/products'
            }
        ],
        // Desktop scroll overlays
        desktopScrolls: [
            {
                id: 1,
                start: 0,
                end: 0.2,
                align: 'center',
                heading: 'Electrici-Toys.',
                description: ''
            },
            {
                id: 2,
                start: 0.25,
                end: 0.5,
                align: 'start',
                heading: 'Precision Engineering.',
                description: 'Every component designed for maximum performance and durability.'
            },
            {
                id: 3,
                start: 0.55,
                end: 0.8,
                align: 'end',
                heading: 'Ultra-High Quality.',
                description: 'Materials sourced from the future. Built to last a lifetime.'
            },
            {
                id: 4,
                start: 0.85,
                end: 1.0,
                align: 'center',
                heading: 'Exciting Toys.',
                description: '',
                ctaText: 'SHOP COLLECTION',
                ctaLink: '/products'
            }
        ],
        // Mobile overlay branding
        mobileOverlay: {
            top: {
                line1: 'URBAN',
                line2: 'REVOLUTION',
                subtitle: 'Series One • 2026'
            },
            bottom: {
                stats: [
                    { value: '80', unit: 'KM/H', label: 'Speed' },
                    { value: '120', unit: 'KM', label: 'Range' },
                    { value: '3.2', unit: 'S', label: '0-60' }
                ],
                heading: 'ENGINEERED FOR THRILLS',
                description: 'Precision crafted for the ultimate urban commute.'
            }
        },
        footer: {
            tagline: 'The Future is Here',
            heading: 'READY TO\nPLAY?',
            buttons: [
                { text: 'ENTER STORE', link: '/products', variant: 'primary' },
                { text: 'Go To Dashboard', link: '/home', variant: 'outline' }
            ],
            copyright: 'Electrici-Toys © 2026. Engineered for Thrills.'
        }
    },
    legalPages: {
        privacyPolicy: {
            title: 'Privacy Policy',
            lastUpdated: 'January 20, 2026',
            content: `## 1. Introduction\nWelcome to Electrici-Toys. We respect your privacy and are committed to protecting your personal data.\n\n## 2. Data We Collect\nWe collect information to provide better services to all our users. This includes:\n- Personal identification information (Name, email address, phone number, etc.)\n- Transaction data\n- Technical data`
        },
        termsOfService: {
            title: 'Terms of Service',
            lastUpdated: 'January 20, 2026',
            content: `## 1. Agreement to Terms\nBy accessing our website, you agree to be bound by these Terms of Service.\n\n## 2. Intellectual Property\nThe content on this site is the property of Electrici-Toys and is protected by copyright laws.`
        },
        refundPolicy: {
            title: 'Refund Policy',
            lastUpdated: 'January 20, 2026',
            content: `## 1. Returns\nYou have 7 calendar days to return an item from the date you received it.\n\n## 2. Refunds\nOnce we receive your item, we will inspect it and notify you that we have received your returned item.`
        }
    },
    testimonials: [
        {
            id: 1,
            name: "Ankit Rathi",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            rating: 5,
            text: "Uber product, sturdy, fun to use and good support of tech. More stars for efficient and swift after sales team & since they manufacture themselves they have all spares ready stock for repairing.. Kudos for the excellent product.",
            date: "Monday, Jan 16, 2023"
        },
        {
            id: 2,
            name: "Jyoti Dang",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 5,
            text: "It was packaged well and the hoverboard itself is well made. My daughter rides it around the house and the park. It has been working very well so far. The Staff really supports in choosing the right model.",
            date: "Thursday, Feb 02, 2023"
        },
        {
            id: 3,
            name: "Rahul Mehra",
            image: "https://randomuser.me/api/portraits/men/86.jpg",
            rating: 5,
            text: "Absolutely mind-blowing experience! The delivery was super fast, and the unboxing felt premium. My son hasn't got off the electric scooter since it arrived. Battery life is better than advertised.",
            date: "Saturday, Mar 18, 2023"
        },
        {
            id: 4,
            name: "Priya Sharma",
            image: "https://randomuser.me/api/portraits/women/65.jpg",
            rating: 4,
            text: "Great build quality and very responsive customer service. Had a small issue with the charger, but they replaced it within 24 hours. Highly recommended for anyone looking for reliable electric toys.",
            date: "Wednesday, Apr 05, 2023"
        }
    ],
    globalSettings: {
        siteName: 'ELECTRICI TOYS-HUB',
        brandColor: '#3b82f6', // primary blue
        logo: '/logo.png',
        socialLinks: {
            instagram: '',
            facebook: '',
            twitter: ''
        }
    }
};

export const useContentStore = create(
    persist(
        (set, get) => ({
            content: defaultContent,
            loading: false,
            error: null,

            // Fetch page content from backend
            fetchPageContent: async (page) => {
                // Hardcode Experience page to use default content always
                if (page === 'experiencePage') return;

                set({ loading: true, error: null });
                try {
                    const response = await api.get(`/content/${page}`);
                    if (response.data.success && response.data.data) {
                        set(state => ({
                            content: {
                                ...state.content,
                                // Merge backend data with default data to ensure structure
                                [page]: {
                                    ...defaultContent[page],
                                    ...response.data.data
                                }
                            }
                        }));
                    }
                } catch (error) {
                    console.error(`Failed to fetch ${page} content:`, error);
                    set({ error: error.message, loading: false });
                } finally {
                    set({ loading: false });
                }
            },

            // Fetch available categories from backend for selection
            fetchBackendCategories: async () => {
                try {
                    const response = await api.get('/category/all');
                    if (response.data.success) {
                        return response.data.data;
                    }
                    return [];
                } catch (error) {
                    console.error("Failed to fetch backend categories:", error);
                    return [];
                }
            },

            // Update entire page content
            updatePageContent: async (page, data) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.post(`/content/${page}`, { data });
                    if (response.data.success) {
                        set((state) => ({
                            content: {
                                ...state.content,
                                [page]: data
                            }
                        }));
                        return { success: true };
                    }
                } catch (error) {
                    console.error(`Failed to update ${page} content:`, error);
                    set({ error: error.message, loading: false });
                    return { success: false, error: error.message };
                } finally {
                    set({ loading: false });
                }
            },

            // Update specific section of a page
            updateSection: (page, section, data) => set((state) => ({
                content: {
                    ...state.content,
                    [page]: {
                        ...state.content[page],
                        [section]: data
                    }
                }
            })),

            // Helper to update root level content like testimonials
            updateRootContent: (key, data) => set((state) => ({
                content: {
                    ...state.content,
                    [key]: data
                }
            })),

            // Reset to defaults
            resetToDefaults: () => set({ content: defaultContent }),

            // Get specific page content
            getPageContent: (page) => (state) => state.content[page]
        }),
        {
            name: 'electrici-content-storage',
            version: 8,
            migrate: (persistedState, version) => {
                return persistedState;
            }
        }
    )
);
