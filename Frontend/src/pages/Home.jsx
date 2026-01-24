import React, { useRef, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Marquee from '../components/Marquee';
import { theme } from '../theme';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Battery, Zap, Shield, ChevronLeft, ChevronRight, ShoppingCart, ShieldCheck, Banknote, Clock, Truck, FileText, CheckCircle, ChevronDown, ChevronUp, Play, Check, Star } from 'lucide-react';
import AnimatedFeature from '../components/AnimatedFeature';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('Hoverboards');
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1593953443285-168452735460?q=80&w=2940&auto=format&fit=crop",
      title: "Future of Mobility",
      subtitle: "Experience the thrill of next-gen electric scooters.",
      cta: "Shop Scooters"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2940&auto=format&fit=crop", // Motorbike placeholder for ride-on
      title: "Adventure Awaits",
      subtitle: "Off-road hoverboards for the ultimate explorer.",
      cta: "Explore Hoverboards"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1620802051782-48cb7cd75785?q=80&w=2940&auto=format&fit=crop", // E-bike
      title: "Eco-Friendly Commute",
      subtitle: "Efficient, stylish, and sustainable segways.",
      cta: "View Segways"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  // Scroll Animations
  const mainRef = useRef(null);
  const sectionRefs = useRef([]);

  useGSAP(() => {
    sectionRefs.current.forEach((el, index) => {
      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      });
    });
  }, { scope: mainRef });

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-white" style={{ fontFamily: theme.fonts.body }}>
      <Marquee />

      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter drop-shadow-lg transform transition-all duration-700 translate-y-0 opacity-100"
                style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0 }}
              >
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto font-light"
                style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transitionDelay: '0.2s' }}
              >
                {slide.subtitle}
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center shadow-lg"
                style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transitionDelay: '0.4s' }}
              >
                {slide.cta} <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all">
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-blue-500 w-8' : 'bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>

      {/* Value Proposition Strip */}
      {/* Value Proposition Strip */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-y-6 md:gap-y-0">

            <div className="flex items-center space-x-3 w-1/2 md:w-auto justify-center md:justify-start group cursor-pointer">
              <AnimatedFeature icon={ShieldCheck} delay={0.1} />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">1 Year</p>
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Warranty</p>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-4"></div>
            </div>

            <div className="flex items-center space-x-3 w-1/2 md:w-auto justify-center md:justify-start group cursor-pointer">
              <AnimatedFeature icon={Banknote} delay={0.2} />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">No Cost</p>
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">EMI</p>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-4"></div>
            </div>

            <div className="flex items-center space-x-3 w-1/2 md:w-auto justify-center md:justify-start group cursor-pointer">
              <AnimatedFeature icon={Clock} delay={0.3} />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Same Day</p>
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Dispatch</p>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-4"></div>
            </div>

            <div className="flex items-center space-x-3 w-1/2 md:w-auto justify-center md:justify-start group cursor-pointer">
              <AnimatedFeature icon={Banknote} delay={0.4} />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Cash on</p>
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Delivery</p>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-4"></div>
            </div>

            <div className="flex items-center space-x-3 w-1/2 md:w-auto justify-center md:justify-start group cursor-pointer">
              <AnimatedFeature icon={Truck} delay={0.5} />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Free</p>
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Shipping</p>
              </div>
              <div className="hidden md:block h-8 w-px bg-gray-300 mx-4"></div>
            </div>

            <div className="flex items-center space-x-3 w-1/2 md:w-auto justify-center md:justify-start group cursor-pointer">
              <AnimatedFeature icon={FileText} delay={0.6} />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">GST</p>
                <p className="font-bold text-gray-900 text-sm uppercase leading-tight group-hover:text-blue-600 transition-colors">Invoice</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Preview (Values based on "Our Products") */}
      <section className="py-24 bg-gray-50 from-gray-50 to-white bg-gradient-to-b" ref={addToRefs}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4 relative z-10">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Products</span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 max-w-2xl mx-auto mt-6 text-lg font-light leading-relaxed">
              Discover our premium collection of next-generation electric rides. Built for performance, designed for style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'HOVERBOARDS', price: 'RS. 8,999/-', image: 'https://images.unsplash.com/photo-1593953443285-168452735460?q=80&w=600&auto=format&fit=crop', category: 'Hoverboards' },
              { title: 'SEGWAYS', price: 'RS. 23,399/-', image: 'https://images.unsplash.com/photo-1620802051782-48cb7cd75785?q=80&w=600&auto=format&fit=crop', category: 'Mini Segway' },
              { title: 'E-SCOOTERS', price: 'RS. 15,299/-', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&auto=format&fit=crop', category: 'Electric Scooter' },
              { title: 'DRIFTERS', price: 'RS. 16,199/-', image: 'https://images.unsplash.com/photo-1517502839167-0e6d8c4c2317?q=80&w=600&auto=format&fit=crop', category: 'Drifter' },
            ].map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center p-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 w-full text-center transform transition-all duration-500 group-hover:scale-105 rounded-xl shadow-2xl">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2 drop-shadow-md">{item.title}</h3>
                      <div className="w-12 h-1 bg-white/50 mx-auto mb-4 rounded-full"></div>
                      <p className="text-cyan-300 font-bold text-xs uppercase tracking-widest mb-1">Starts From</p>
                      <p className="text-2xl text-white font-bold mb-6 drop-shadow-sm">{item.price}</p>

                      <button className="bg-white text-gray-900 px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-full shadow-lg transform group-hover:-translate-y-1">
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 max-w-7xl mx-auto px-4" ref={addToRefs}>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-500 uppercase tracking-wide mb-8">Best Sellers</h2>

          {/* Category Tabs */}
          <div className="flex justify-center gap-8 mb-12 text-sm md:text-base font-medium text-gray-600">
            {['Hoverboards', 'Mini Segways', 'E-Scooter'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`pb-1 transition-all ${activeCategory === tab ? 'text-white bg-blue-500 px-6 py-1.5 rounded-sm shadow-sm' : 'hover:text-blue-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'H6 Eco (Street)',
              originalPrice: 'Rs. 18,999.00',
              price: 'Rs. 8,999.00',
              image: 'https://images.unsplash.com/photo-1593953443285-168452735460?q=80&w=600&auto=format&fit=crop',
              tag: 'Sale',
              discount: '-53%',
              category: 'Hoverboards',
              accessories: ['https://cdn-icons-png.flaticon.com/512/3566/3566345.png']
            },
            {
              name: 'H6 Galaxy',
              originalPrice: 'Rs. 22,999.00',
              price: 'Rs. 11,999.00',
              image: 'https://images.unsplash.com/photo-1620802051782-48cb7cd75785?q=80&w=600&auto=format&fit=crop',
              tag: 'Sale',
              discount: '-48%',
              category: 'Hoverboards',
              accessories: ['https://cdn-icons-png.flaticon.com/512/3566/3566345.png', 'https://cdn-icons-png.flaticon.com/512/683/683072.png']
            },
            {
              name: 'H8+ (Skullcandy)',
              originalPrice: 'Rs. 31,999.00',
              price: 'Rs. 15,999.00',
              image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600&auto=format&fit=crop',
              tag: 'New',
              subTag: 'Sale', // Supports multiple tags
              discount: '-50%',
              category: 'Hoverboards',
              freeGift: true,
              accessories: ['https://cdn-icons-png.flaticon.com/512/3566/3566345.png', 'https://cdn-icons-png.flaticon.com/512/683/683072.png', 'https://cdn-icons-png.flaticon.com/512/10398/10398634.png']
            },
            {
              name: 'Gyroor GNU Kids',
              originalPrice: 'Rs. 39,999.00',
              price: 'Rs. 19,999.00',
              image: 'https://images.unsplash.com/photo-1517502839167-0e6d8c4c2317?q=80&w=600&auto=format&fit=crop',
              tag: 'Sale',
              discount: '-50%',
              category: 'Hoverboards',
              accessories: []
            },
          ].map((product, idx) => (
            <div key={idx} className="group bg-white flex flex-col items-center">

              <div className="relative w-full mb-4 flex justify-center p-4">
                {/* Tags */}
                <div className="absolute top-0 left-0 flex flex-col gap-1">
                  {product.tag === 'New' && <span className="text-[10px] font-medium text-gray-500 bg-transparent mb-1 block">New</span>}
                  {(product.tag === 'Sale' || product.subTag === 'Sale') && <span className="bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm">Sale</span>}
                </div>

                <img src={product.image} alt={product.name} className="h-48 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
              </div>

              {/* Accessories Row */}
              {product.accessories && product.accessories.length > 0 && (
                <div className="flex items-center gap-2 mb-4 relative">
                  {product.freeGift && (
                    <span className="absolute -left-12 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-bold p-1 rounded-full w-8 h-8 flex items-center justify-center animate-pulse z-10 border-2 border-white border-dashed">FREE</span>
                  )}
                  {product.accessories.map((acc, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border border-gray-200 p-1 flex items-center justify-center bg-white shadow-sm hover:border-blue-400 transition-colors">
                      <img src={acc} alt="Accessory" className="w-full h-full object-contain opacity-70" />
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center w-full px-2">
                <h3 className="font-bold text-gray-800 text-base mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-gray-400 line-through text-xs font-bold">{product.originalPrice}</span>
                  {product.categoryId !== 'Gyroor' && <span className="text-gray-400 text-xs">From</span>}
                  <span className="text-blue-500 font-bold text-sm">{product.price}</span>
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{product.discount}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a href="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            View All Collections <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-20 bg-white overflow-hidden" ref={addToRefs}>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-widest mb-3">@hoverpro_india</h2>
          <p className="text-gray-500 font-medium">Follow us on Instagram for daily customized rides</p>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Grid / Mobile Stack */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              "https://images.unsplash.com/photo-1544654050-b4d1632f0ebc?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1620802051782-48cb7cd75785?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1596484552834-8b654f5d2210?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
            ].map((img, i) => (
              <div key={i} className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer shadow-md hover:shadow-xl transition-all duration-500">
                <img src={img} alt="Instagram Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex items-center gap-4 text-white">
                    <span className="flex items-center gap-1 font-bold"><span className="text-pink-500">♥</span> {120 + i * 15}</span>
                    <span className="flex items-center gap-1 font-bold">💬 {12 + i}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-3 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 mx-auto">
              <span className="text-xl">📷</span> Follow @HoverPro
            </button>
          </div>
        </div>
      </section>

      {/* Safety & Quality Info Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden" ref={addToRefs}>
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 -skew-x-12 transform origin-top-right z-0 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1616894562088-7e5055047ae3?q=80&w=1000&auto=format&fit=crop" alt="Premium Quality" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border-l-4 border-blue-600">
                  <p className="font-black text-gray-900 text-lg">ENGINEERED FOR INDIA</p>
                  <p className="text-xs text-gray-500 font-bold tracking-wider">PREMIUM BUILD QUALITY</p>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                  Safety Meets <span className="text-blue-600 block">Performance</span>
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mb-8"></div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6 font-light">
                  We are committed to our customers' safety while riding our electric hoverboards and leave no stone unturned to ensure <b className="text-gray-900">premium segment comfort</b> and safety go hand-in-hand.
                </p>
                <p className="text-gray-600 leading-relaxed font-light">
                  To provide a premium customer experience, we expose our wide range of products to intensive hands-on experience by consumer product experts before introducing them. We conduct several <b className="text-gray-900">design testing levels</b> to ensure top-notch quality.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Quality Tested</h4>
                    <p className="text-xs text-gray-500 mt-1">Rigorous safety checks for every unit.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Battery className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Premium Battery</h4>
                    <p className="text-xs text-gray-500 mt-1">Long-lasting, safe lithium-ion cells.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <img src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="Agent" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-0.5">Need Help?</p>
                  <p className="text-2xl font-black text-gray-900">+91 7982 839 898</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white" ref={addToRefs}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-2">Reviews</h2>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-4xl font-light text-gray-500">4.6</span>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" className="w-5 h-5" />)}
              </div>
              <span className="text-blue-500 font-medium">(156 reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Krishna A.",
                location: "Vallabh Vidvanagar",
                review: "Excellent build quality and battery life. My son loves it! The delivery was super fast as well.",
                product: "Hoverpro Adjust...",
                color: "Galaxy",
                daysAgo: "3 months ago",
                image: "https://images.unsplash.com/photo-1593953443285-168452735460?q=80&w=200&auto=format&fit=crop"
              },
              {
                name: "Edmond F.",
                location: "North Goa, GA",
                review: "My kids (8 & 11) just loved it. Best gift for their birthday. Sturdy and safe.",
                product: "Jetson Mojo (Bl...",
                color: "Black",
                daysAgo: "6 months ago",
                image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop"
              },
              {
                name: "Saalim M.",
                location: "New Delhi, DL",
                review: "With hoverpro the experience was okay to good..good is i asked customer support for help and they guided perfectly.",
                product: "H6 Eco (Galaxy)",
                color: "Multi",
                daysAgo: "5 months ago",
                image: "https://images.unsplash.com/photo-1620802051782-48cb7cd75785?q=80&w=200&auto=format&fit=crop"
              }
            ].map((review, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex text-yellow-400 mb-4 gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" className="w-4 h-4" />)}
                </div>
                <p className="text-gray-600 mb-6 italic line-clamp-3">"{review.review}"</p>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={review.image} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                      {review.name} <CheckCircle className="w-3 h-3 text-blue-500" />
                    </h4>
                    <p className="text-xs text-gray-400">{review.location}</p>
                    <p className="text-xs text-blue-500 mt-0.5">{review.product}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-300">{review.daysAgo}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Write a Review
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50" ref={addToRefs}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-500 mb-2">Questions in mind?</h2>
            <p className="text-2xl font-bold text-gray-900">Read our FAQs</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Can I ride the Hoverboard on grass or gravel?",
                a: "Yes, you can ride our hoverboard on grass or gravel. However, it depends on the model! Our H6 and H8 hoverboards are ideal for smooth pavements, malls, and indoor fun—but they're not cut out for rough terrains. If you're fond of adventure on gravel, grass, or bumpy paths, go for our H9 or H11 Off-Road Hoverboards. They're built tough to glide over almost anything."
              },
              {
                q: "Does it have Bluetooth?",
                a: "Yes! Most of our premium models come equipped with high-quality Bluetooth speakers so you can jam to your favorite tunes while you ride."
              },
              {
                q: "Does it come with a charger?",
                a: "Absolutely. Every hoverboard ships with a specialized high-speed charger designed to keep your battery healthy and charge quickly."
              },
              {
                q: "What's the warranty of your products?",
                a: "We offer a comprehensive 1-year warranty on all our Hoverboards, covering motor and battery issues. We also have a dedicated service center."
              },
              {
                q: "Is the self-balancing Hoverboard safe and comfortable to ride?",
                a: "Safety is our #1 priority. Our boards feature auto-balance technology making them easy to learn (usually 5-10 minutes). They are UL2272 certified against fire hazards."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                <button
                  onClick={() => {
                    const el = document.getElementById(`faq-ans-${idx}`);
                    const icon = document.getElementById(`faq-icon-${idx}`);
                    if (el.style.maxHeight) {
                      el.style.maxHeight = null;
                      icon.style.transform = 'rotate(0deg)';
                    } else {
                      el.style.maxHeight = el.scrollHeight + "px";
                      icon.style.transform = 'rotate(180deg)';
                    }
                  }}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.q}</span>
                  <ChevronDown id={`faq-icon-${idx}`} className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                </button>
                <div id={`faq-ans-${idx}`} className="max-h-0 overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50">
                  <p className="p-6 pt-0 text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 bg-gray-900 text-white relative overflow-hidden" ref={addToRefs}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Ride the Future?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Join thousands of happy riders. Sign up for our newsletter to get exclusive deals, new launch alerts, and maintenance tips.</p>

          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-6 py-4 rounded-full bg-white/10 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow backdrop-blur-sm"
            />
            <button className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105">
              Subscribe
            </button>
          </form>
          <p className="mt-6 text-sm text-gray-500">No spam, we promise. Unsubscribe anytime.</p>
        </div>
      </section>
    </div >
  );
};

export default Home;
