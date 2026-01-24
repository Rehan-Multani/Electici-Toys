import React, { useRef, useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '../modules/user/lib/animations';

const MegaMenu = ({ items }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute top-full left-0 w-full glass shadow-2xl border-t border-white/10 z-50 overflow-hidden"
    >
      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-3 gap-12">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center text-center group/item cursor-pointer space-y-4"
            >
              <div className="overflow-hidden h-56 w-full flex items-center justify-center p-6 bg-secondary/5 rounded-[2rem] group-hover/item:bg-secondary/10 transition-colors">
                <img src={item.image} alt={item.name} className="h-full object-contain group-hover/item:scale-110 transition-transform duration-700 ease-out filter drop-shadow-xl" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black italic text-foreground uppercase tracking-tighter text-lg leading-none group-hover/item:text-primary transition-colors">{item.name}</h4>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      name: 'Hoverboards',
      items: [
        { name: 'Classic Hoverboards', image: 'https://images.unsplash.com/photo-1593953443285-168452735460?q=80&w=400&auto=format&fit=crop', desc: 'Starting from ₹8,999' },
        { name: 'Off-Road Series', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop', desc: 'All Terrain Capability' },
        { name: 'Premium Self-Balancing', image: 'https://images.unsplash.com/photo-1620802051782-48cb7cd75785?q=80&w=400&auto=format&fit=crop', desc: 'Top Tier Performance' }
      ]
    },
    {
      name: 'Segways',
      items: [
        { name: 'Commuter Segways', image: 'https://images.unsplash.com/photo-1517502839167-0e6d8c4c2317?q=80&w=400&auto=format&fit=crop', desc: 'Daily City Travel' },
        { name: 'Professional Series', image: 'https://images.unsplash.com/photo-1554629947-334ff61d85dc?q=80&w=400&auto=format&fit=crop', desc: 'For Work & Patrol' },
        { name: 'Mini Pros', image: 'https://images.unsplash.com/photo-1615555470659-c294132bb822?q=80&w=400&auto=format&fit=crop', desc: 'Compact Power' }
      ]
    },
    {
      name: 'Scooters',
      items: [
        { name: 'Kids E-Scooters', image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=400&auto=format&fit=crop', desc: 'K1 (Kids E-Scooter)' },
        { name: 'Folding E-Scooters', image: 'https://images.unsplash.com/photo-1593953443285-168452735460?q=80&w=400&auto=format&fit=crop', desc: 'X1 (15-20kms Range)' },
        { name: 'Offroader E-Scooter', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop', desc: 'Beast Air (10inch Off-Roader)' }
      ]
    },
    {
      name: 'Drifter',
      items: [
        { name: 'Drift Karts 360', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop', desc: 'Spin & Drift Action' },
        { name: 'Electric Gokarts', image: 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=400&auto=format&fit=crop', desc: 'Track Ready Speed' },
        { name: 'Crazy Carts', image: 'https://plus.unsplash.com/premium_photo-1661293818249-fdd2f0bb231c?q=80&w=400&auto=format&fit=crop', desc: 'Fun for All Ages' }
      ]
    },
    {
      name: 'Kids RideONs',
      items: [
        { name: 'Electric Cars', image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=400&auto=format&fit=crop', desc: 'Licensed Replicas' },
        { name: 'Mini Bikes', image: 'https://images.unsplash.com/photo-1622185135505-2d795043dfeb?q=80&w=400&auto=format&fit=crop', desc: 'First Two-Wheeler' },
        { name: 'Jeeps & ATVs', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400&auto=format&fit=crop', desc: 'Off-Road fun for Kids' }
      ]
    },
    { name: 'Support', items: [] },
  ];

  const handleMouseEnter = (name) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const activeItems = navLinks.find(l => l.name === activeDropdown)?.items || [];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${scrolled ? 'glass h-20 shadow-xl' : 'bg-transparent h-28'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 flex items-center cursor-pointer"
          >
            <span className="text-3xl font-black italic tracking-tighter text-foreground">
              Electrici<span className="text-primary tracking-[-0.1em] not-italic text-glow">TOYS</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex h-full items-center">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="h-full flex items-center group px-6 relative"
                onMouseEnter={() => handleMouseEnter(link.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeDropdown === link.name ? 'text-primary' : 'text-foreground/70'
                    } hover:text-primary leading-none`}
                >
                  {link.name}
                </button>
                {activeDropdown === link.name && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary shadow-glow"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.button whileHover={{ scale: 1.2, rotate: 10 }} className="text-foreground/70 hover:text-primary transition-colors">
              <Search className="w-6 h-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.2, rotate: -10 }} className="text-foreground/70 hover:text-primary transition-colors">
              <User className="w-6 h-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.2, rotate: 10 }} className="text-foreground/70 hover:text-pink-500 transition-colors relative">
              <Heart className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-foreground/70 hover:text-primary transition-colors relative group"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2.5 -right-2.5 bg-primary text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-glow">0</span>
              </div>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary focus:outline-none transition-colors"
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {activeDropdown && activeItems.length > 0 && (
          <div
            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
            onMouseLeave={handleMouseLeave}
          >
            <MegaMenu items={activeItems} />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background md:hidden p-8 flex flex-col pt-24"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-8 right-8 text-foreground"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="space-y-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href="#"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="block text-4xl font-black italic tracking-tighter uppercase text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
