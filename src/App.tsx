import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import OrderPanel, { type PanelView } from "./OrderPanel";
import {
  formatRupiah,
  INSTAGRAM_URL,
  readyProducts,
  WHATSAPP_NUMBER,
  type CartItem,
  type PreparedRequest,
  type ReadyProduct,
} from "./data";

const occasions = [
  {
    name: "Birthday",
    image: "/images/birthday.jpg",
    alt: "Handmade birthday cake with delicate piped details",
    cta: "Celebrate a Birthday",
    product: "Birthday cake or cookies",
    event: "Birthday",
  },
  {
    name: "Baby Shower",
    image: "/images/baby-shower.jpg",
    alt: "Elegant pale sage baby shower cake and cookies",
    cta: "Explore Baby Shower",
    product: "Baby shower desserts",
    event: "Baby shower",
  },
  {
    name: "Gifts & Special Events",
    image: "/images/gifts.jpg",
    alt: "Thoughtfully arranged decorated cookies in a gift box",
    cta: "Find Something Special",
    product: "Gift or special event sweets",
    event: "Gift",
  },
];

const categories = [
  {
    name: "Cakes",
    description: "Classic, fondant and specialty cakes for every celebration.",
    image: "/images/cakes.jpg",
    alt: "Ivory celebration cake with delicate chocolate details",
    action: "cake",
  },
  {
    name: "Cookies",
    description: "Decorated cookies, bouquets, towers, jumbo and mini bites.",
    image: "/images/cookies.jpg",
    alt: "Hand-decorated floral cookies on linen",
    action: "cookies",
  },
  {
    name: "Cupcakes",
    description: "Beautiful boxes, bouquets and towers to share.",
    image: "/images/cupcakes.jpg",
    alt: "Artisan cupcakes with piped buttercream in an open box",
    action: "cupcakes",
  },
  {
    name: "DIY Kits",
    description: "Cookie decorating kits for birthdays and little celebrations.",
    image: "/images/diy-kits.jpg",
    alt: "DIY cookie decorating kit with cookies and icing",
    action: "diy",
  },
];

const socialImages = [
  { image: "/images/birthday.jpg", alt: "Piped birthday cake" },
  { image: "/images/cookies.jpg", alt: "Floral custom cookies" },
  { image: "/images/cupcakes.jpg", alt: "Box of celebration cupcakes" },
  { image: "/images/baby-shower.jpg", alt: "Baby shower cake and cookies" },
  { image: "/images/gifts.jpg", alt: "Gift box of decorated cookies" },
  { image: "/images/cupcake-tower.jpg", alt: "Cupcake and cookie tower" },
];

function readSavedCart(): CartItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem("sweetation-cart") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [panel, setPanel] = useState<PanelView>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ReadyProduct>(readyProducts[0]);
  const [customContext, setCustomContext] = useState({ product: "Custom Cookies", occasion: "" });
  const [cart, setCart] = useState<CartItem[]>(readSavedCart);
  const [prepared, setPrepared] = useState<PreparedRequest | null>(null);
  const [toast, setToast] = useState("");
  const processRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: processRef, offset: ["start 82%", "end 38%"] });
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem("sweetation-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.11, rootMargin: "0px 0px -35px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = panel || mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panel, mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function openPanel(view: PanelView) {
    setMobileMenuOpen(false);
    setPanel(view);
  }

  function openCustom(product = "Custom Cookies", occasion = "") {
    setCustomContext({ product, occasion });
    openPanel("custom");
  }

  function selectProduct(product: ReadyProduct) {
    setSelectedProduct(product);
    openPanel("product");
  }

  function scrollToSection(id: string) {
    setMobileMenuOpen(false);
    setPanel(null);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 30);
  }

  function handleCategory(action: string) {
    if (action === "cake") openPanel("cake");
    if (action === "cookies") openCustom("Custom Cookies");
    if (action === "cupcakes") selectProduct(readyProducts[0]);
    if (action === "diy") selectProduct(readyProducts[1]);
  }

  function addItem(product: ReadyProduct, quantity: number, colours: string, wording: string) {
    const key = `${product.id}:${colours.toLowerCase()}:${wording.toLowerCase()}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => item.key === key ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item);
      }
      return [...current, { key, productId: product.id, name: product.name, image: product.image, price: product.price, quantity, colours, wording }];
    });
    setToast(`${product.name} added to your bag`);
    openPanel("cart");
  }

  function updateItem(key: string, quantity: number) {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.key !== key));
      return;
    }
    setCart((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.min(99, quantity) } : item));
  }

  function prepareRequest(request: PreparedRequest) {
    setPrepared(request);
    openPanel("prepared");
  }

  return (
    <>
      <header className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="header-inner">
          <button className="header-logo" type="button" onClick={() => scrollToSection("top")} aria-label="Sweetation, back to top">
            <span className="logo-main">SWEETATION<span className="logo-dot">.</span></span>
            <span className="logo-sub">CELEBRATION STUDIO</span>
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            <button type="button" onClick={() => scrollToSection("shop")}>Shop</button>
            <button type="button" onClick={() => openCustom()}>Custom Orders</button>
            <button type="button" onClick={() => scrollToSection("occasions")}>Occasions</button>
            <button type="button" onClick={() => scrollToSection("about")}>About</button>
          </nav>
          <div className="header-actions">
            <button className="icon-button header-search" type="button" aria-label="Search" onClick={() => openPanel("search")}><Search size={21} strokeWidth={1.55} /></button>
            <button className="icon-button bag-button" type="button" aria-label={`Open bag, ${cartCount} items`} onClick={() => openPanel("cart")}>
              <ShoppingBag size={21} strokeWidth={1.55} />
              {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
            </button>
            <button className="button header-order" type="button" onClick={() => openPanel("chooser")}>Order Now <ArrowUpRight size={16} strokeWidth={1.7} /></button>
            <button className="icon-button mobile-menu-button" type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Navigation menu">
          <p className="eyebrow">EXPLORE SWEETATION</p>
          <nav aria-label="Mobile navigation">
            <button type="button" onClick={() => scrollToSection("shop")}>Shop <ArrowUpRight size={22} /></button>
            <button type="button" onClick={() => openCustom()}>Custom Orders <ArrowUpRight size={22} /></button>
            <button type="button" onClick={() => scrollToSection("occasions")}>Occasions <ArrowUpRight size={22} /></button>
            <button type="button" onClick={() => scrollToSection("about")}>About <ArrowUpRight size={22} /></button>
          </nav>
          <button className="button button-dark button-wide" type="button" onClick={() => openPanel("chooser")}>Order Now <ArrowRight size={18} /></button>
        </div>
      )}

      <main>
        <section id="top" className="hero" aria-label="Sweetation custom celebration desserts">
          <div className="hero-image" role="img" aria-label="Handmade celebration cake, decorated cookies and cupcakes" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="hero-brand">Sweetation<span>.</span></p>
            <h1>Sweet moments,<br /><em>made just for you.</em></h1>
            <p className="hero-description">Custom cakes, cookies &amp; sweet creations for every celebration.</p>
            <div className="hero-buttons">
              <button className="button button-cream" type="button" onClick={() => scrollToSection("shop")}>Explore Collection <ArrowUpRight size={17} strokeWidth={1.7} /></button>
              <button className="button button-ghost" type="button" onClick={() => openPanel("chooser")}>Create Your Order <ArrowUpRight size={17} strokeWidth={1.7} /></button>
            </div>
          </div>
          <button className="hero-scroll" type="button" onClick={() => scrollToSection("occasions")}>SCROLL TO EXPLORE <ArrowDown size={15} strokeWidth={1.5} /></button>
        </section>

        <section id="occasions" className="section occasions-section">
          <div className="page-container">
            <div className="section-heading-row reveal">
              <div><p className="eyebrow">01 / THE OCCASIONS</p><h2>Made for every<br /><em>celebration.</em></h2></div>
              <p className="section-intro">From birthdays to baby showers, every moment deserves something sweet.</p>
            </div>
            <div className="occasions-grid">
              {occasions.map((occasion, index) => (
                <button className={`occasion-card occasion-card-${index + 1} reveal`} type="button" key={occasion.name} onClick={() => openCustom(occasion.product, occasion.event)}>
                  <span className="image-frame occasion-image"><img src={occasion.image} alt={occasion.alt} loading="lazy" /></span>
                  <span className="occasion-meta"><span className="occasion-name">{occasion.name}</span><ArrowUpRight size={23} strokeWidth={1.3} /></span>
                  <span className="card-cta">{occasion.cta}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="shop" className="section categories-section">
          <div className="page-container">
            <div className="section-heading-row reveal">
              <div><p className="eyebrow">02 / THE COLLECTION</p><h2>Find Your <em>Sweet.</em></h2></div>
              <p className="section-intro">Choose something ready to order, or create something completely your own.</p>
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <button className="category-card reveal" type="button" key={category.name} onClick={() => handleCategory(category.action)}>
                  <span className="image-frame category-image"><img src={category.image} alt={category.alt} loading="lazy" /></span>
                  <span className="category-heading"><span>{category.name}</span><ArrowUpRight size={22} strokeWidth={1.4} /></span>
                  <span className="category-description">{category.description}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="ordering" className="section ordering-section">
          <div className="page-container">
            <div className="ordering-heading reveal">
              <p className="eyebrow">03 / A SWEETER WAY TO ORDER</p>
              <h2>Choose how you<br /><em>want to order.</em></h2>
              <p>From a favorite off the menu to something entirely yours, there's a simple way to begin.</p>
            </div>
            <div className="order-types">
              <button className="order-type reveal" type="button" onClick={() => openPanel("catalog")}>
                <span className="order-type-number">01 <span>READY TO ORDER</span></span>
                <span className="order-type-title">Pick your<br /><em>favorite.</em></span>
                <span className="order-type-description">Set prices, sweet choices, no guesswork.</span>
                <span className="order-type-examples">Mini Bites / DIY Kits / Cupcake Tower / Tartlet Box</span>
                <span className="order-type-link">Shop Ready-to-Order <ArrowUpRight size={18} strokeWidth={1.4} /></span>
              </button>
              <button className="order-type reveal" type="button" onClick={() => openPanel("cake")}>
                <span className="order-type-number">02 <span>BUILD YOUR ORDER</span></span>
                <span className="order-type-title">Your cake,<br /><em>your way.</em></span>
                <span className="order-type-description">Choose the details that make it yours.</span>
                <span className="order-type-examples">Size / Flavour / Filling / Toppers / Cookies / Colours</span>
                <span className="order-type-link">Build Your Cake <ArrowUpRight size={18} strokeWidth={1.4} /></span>
              </button>
              <button className="order-type reveal" type="button" onClick={() => openCustom()}>
                <span className="order-type-number">03 <span>MAKE IT YOURS</span></span>
                <span className="order-type-title">Dream it.<br /><em>We'll make it.</em></span>
                <span className="order-type-description">One-of-a-kind sweets, thoughtfully created.</span>
                <span className="order-type-examples">Custom Cookies / Towers / 3D Cookies / Bouquets</span>
                <span className="order-type-link">Start a Custom Order <ArrowUpRight size={18} strokeWidth={1.4} /></span>
              </button>
            </div>
          </div>
        </section>

        <section id="process" className="section process-section" ref={processRef}>
          <div className="page-container">
            <div className="process-heading reveal"><p className="eyebrow">04 / HOW IT WORKS</p><h2>From your idea to<br /><em>something sweet.</em></h2></div>
            <div className="process-steps">
              <div className="process-line"><div className="process-line-base" /><motion.div className="process-line-fill process-line-fill-desktop" style={{ scaleX: scrollYProgress }} /><motion.div className="process-line-fill process-line-fill-mobile" style={{ scaleY: scrollYProgress }} /></div>
              <div className="process-step reveal"><span className="step-number">01</span><h3>Choose</h3><p>Find your cake, cookies, cupcakes or DIY treats.</p></div>
              <div className="process-step reveal"><span className="step-number">02</span><h3>Customize</h3><p>Choose flavours, colours, wording and special extras.</p></div>
              <div className="process-step reveal"><span className="step-number">03</span><h3>Celebrate</h3><p>Choose your date and let Sweetation prepare the rest.</p></div>
            </div>
          </div>
        </section>

        <section className="featured-section" aria-labelledby="featured-title">
          <div className="featured-image"><img src="/images/cupcake-tower.jpg" alt="Cupcake Tower with piped cupcakes and hand-decorated mini cookies" loading="lazy" /></div>
          <div className="featured-copy">
            <div className="featured-copy-inner reveal">
              <p className="eyebrow">05 / THE FEATURED SWEET</p>
              <h2 id="featured-title">Cupcake<br /><em>Tower.</em></h2>
              <p className="featured-intro">A little showstopper for the moments worth gathering around.</p>
              <div className="featured-detail"><span>INCLUDES</span><strong>10 regular cupcakes<br />+ 8 mini cookies</strong></div>
              <div className="featured-detail"><span>MADE FOR YOU</span><strong>Custom colours available<br />Free wording included</strong></div>
              <div className="featured-price">{formatRupiah(480000)}</div>
              <button className="button button-dark" type="button" onClick={() => selectProduct(readyProducts[0])}>Order Cupcake Tower <ArrowUpRight size={18} strokeWidth={1.5} /></button>
            </div>
          </div>
        </section>

        <section className="custom-section" aria-labelledby="custom-title">
          <img className="custom-background" src="/images/cookies.jpg" alt="Close-up of intricate handmade custom decorated cookies" loading="lazy" />
          <div className="custom-shade" />
          <div className="page-container custom-container">
            <div className="custom-copy reveal">
              <p className="eyebrow">THE ONE-OF-A-KIND COLLECTION</p>
              <h2 id="custom-title">Have something<br /><em>special in mind?</em></h2>
              <p>Tell us what you're imagining and we'll help turn it into something sweet.</p>
              <button className="button button-cream" type="button" onClick={() => openCustom()}>Start a Custom Order <ArrowUpRight size={17} strokeWidth={1.5} /></button>
              <span className="custom-small">Custom cakes / cookies / bouquets / towers / special events</span>
            </div>
          </div>
        </section>

        <section className="section social-section" aria-labelledby="social-title">
          <div className="page-container">
            <div className="section-heading-row reveal">
              <div><p className="eyebrow">06 / FROM OUR STUDIO</p><h2 id="social-title">Made to be <em>shared.</em></h2></div>
              <div className="social-heading-right"><p className="section-intro">Follow Sweetation for new creations, celebrations and inspiration.</p><a className="text-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Follow @sweetation_id <ArrowUpRight size={17} strokeWidth={1.5} /></a></div>
            </div>
            <div className="social-grid">
              {socialImages.map((item) => (
                <a className="social-image reveal" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" key={item.image} aria-label={`View Sweetation on Instagram: ${item.alt}`}>
                  <img src={item.image} alt={item.alt} loading="lazy" />
                  <span><Camera size={21} strokeWidth={1.5} /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="page-container closing-inner reveal">
            <p className="eyebrow">LET'S MAKE IT A MOMENT</p>
            <h2>Ready to make your<br /><em>celebration sweeter?</em></h2>
            <div className="closing-buttons">
              <button className="button button-dark" type="button" onClick={() => scrollToSection("shop")}>Explore Collection <ArrowUpRight size={17} strokeWidth={1.5} /></button>
              <button className="button button-outline-dark" type="button" onClick={() => openCustom()}>Start a Custom Order <ArrowUpRight size={17} strokeWidth={1.5} /></button>
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="site-footer">
        <div className="page-container">
          <div className="footer-top">
            <div className="footer-about"><p className="footer-logo">Sweetation<span>.</span></p><p>Thoughtfully made sweets for the moments that matter. Handmade in Jakarta, made just for you.</p></div>
            <div className="footer-column"><h3>EXPLORE</h3><button type="button" onClick={() => scrollToSection("shop")}>Cakes</button><button type="button" onClick={() => openCustom("Custom Cookies")}>Cookies</button><button type="button" onClick={() => selectProduct(readyProducts[0])}>Cupcakes</button><button type="button" onClick={() => selectProduct(readyProducts[1])}>DIY Kits</button></div>
            <div className="footer-column"><h3>SWEETATION</h3><button type="button" onClick={() => openCustom()}>Custom Orders</button><button type="button" onClick={() => scrollToSection("occasions")}>Occasions</button><button type="button" onClick={() => scrollToSection("about")}>About</button><button type="button" onClick={() => openPanel("chooser")}>How to Order</button></div>
            <div className="footer-column"><h3>KEEP IN TOUCH</h3><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={14} /></a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={14} /></a><div className="footer-social"><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Camera size={19} strokeWidth={1.4} /></a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={19} strokeWidth={1.4} /></a></div></div>
          </div>
          <div className="footer-bottom"><span>&copy; {new Date().getFullYear()} Sweetation. All rights reserved.</span><span>Made for the moments worth celebrating.</span></div>
        </div>
      </footer>

      {!mobileMenuOpen && (
        <div className="mobile-order-bar">
          <button type="button" onClick={() => scrollToSection("shop")}>Shop</button>
          <button type="button" onClick={() => openPanel("chooser")}>Order Now <ArrowUpRight size={17} /></button>
        </div>
      )}

      <OrderPanel
        view={panel}
        selectedProduct={selectedProduct}
        cart={cart}
        customContext={customContext}
        prepared={prepared}
        onClose={() => setPanel(null)}
        onView={openPanel}
        onSelectProduct={selectProduct}
        onCustom={openCustom}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onRemoveItem={(key) => setCart((current) => current.filter((item) => item.key !== key))}
        onPrepared={prepareRequest}
      />
      {toast && <div className="toast" role="status"><ShoppingBag size={16} />{toast}</div>}
    </>
  );
}