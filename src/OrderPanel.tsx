import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  formatRupiah,
  readyProducts,
  WHATSAPP_NUMBER,
  type CartItem,
  type PreparedRequest,
  type ReadyProduct,
} from "./data";

export type PanelView =
  | "chooser"
  | "catalog"
  | "product"
  | "cake"
  | "custom"
  | "cart"
  | "checkout"
  | "prepared"
  | "search"
  | null;

type CustomContext = { product: string; occasion: string };

type OrderPanelProps = {
  view: PanelView;
  selectedProduct: ReadyProduct;
  cart: CartItem[];
  customContext: CustomContext;
  prepared: PreparedRequest | null;
  onClose: () => void;
  onView: (view: PanelView) => void;
  onSelectProduct: (product: ReadyProduct) => void;
  onCustom: (product?: string, occasion?: string) => void;
  onAddItem: (product: ReadyProduct, quantity: number, colours: string, wording: string) => void;
  onUpdateItem: (key: string, quantity: number) => void;
  onRemoveItem: (key: string) => void;
  onPrepared: (request: PreparedRequest) => void;
};

const panelLabels: Record<Exclude<PanelView, null>, string> = {
  chooser: "Start your order",
  catalog: "Ready to order",
  product: "Product details",
  cake: "Build your cake",
  custom: "Custom order",
  cart: "Your bag",
  checkout: "Order details",
  prepared: "Your request",
  search: "Search Sweetation",
};

const eventOptions = [
  "Birthday",
  "Baby shower",
  "Wedding",
  "Anniversary",
  "Corporate event",
  "Gift",
  "Other celebration",
];

function localToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="drawer-back" type="button" onClick={onClick}>
      <ArrowLeft size={16} strokeWidth={1.5} /> {children}
    </button>
  );
}

function ChooserContent({
  onView,
  onCustom,
}: {
  onView: (view: PanelView) => void;
  onCustom: () => void;
}) {
  const choices = [
    {
      number: "01",
      eyebrow: "A little something, right away",
      title: "Shop ready to order",
      description: "Pick a favorite with a set price and add it to your bag.",
      action: () => onView("catalog"),
    },
    {
      number: "02",
      eyebrow: "Made to your taste",
      title: "Build your cake",
      description: "Choose your size, flavour, filling and finishing touches.",
      action: () => onView("cake"),
    },
    {
      number: "03",
      eyebrow: "Dream it up",
      title: "Make it yours",
      description: "Tell us your idea and request a thoughtful custom quote.",
      action: onCustom,
    },
  ];

  return (
    <div className="drawer-intro">
      <p className="eyebrow">HOW WOULD YOU LIKE TO ORDER?</p>
      <h2>Something sweet starts here.</h2>
      <p className="drawer-lead">Three simple ways to bring your celebration to life.</p>
      <div className="chooser-list">
        {choices.map((choice) => (
          <button className="chooser-item" type="button" onClick={choice.action} key={choice.number}>
            <span className="chooser-number">{choice.number}</span>
            <span className="chooser-copy">
              <span className="chooser-eyebrow">{choice.eyebrow}</span>
              <strong>{choice.title}</strong>
              <span className="chooser-description">{choice.description}</span>
            </span>
            <ArrowUpRight size={20} strokeWidth={1.4} />
          </button>
        ))}
      </div>
      <p className="drawer-small-note">All the details in one place. Less back-and-forth, more celebrating.</p>
    </div>
  );
}

function CatalogContent({
  onSelectProduct,
  onCustom,
  onView,
}: {
  onSelectProduct: (product: ReadyProduct) => void;
  onCustom: (product: string) => void;
  onView: (view: PanelView) => void;
}) {
  return (
    <div>
      <BackButton onClick={() => onView("chooser")}>All ordering options</BackButton>
      <p className="eyebrow">THE READY COLLECTION</p>
      <h2 className="drawer-heading">Ready when you are.</h2>
      <p className="drawer-lead">Beautifully made favorites with a price you can see upfront.</p>
      <div className="catalog-list">
        {readyProducts.map((product) => (
          <button className="catalog-item" type="button" key={product.id} onClick={() => onSelectProduct(product)}>
            <img src={product.image} alt={product.name} />
            <span className="catalog-item-copy">
              <strong>{product.name}</strong>
              <small>{product.includes}</small>
              <span>{formatRupiah(product.price)}</span>
            </span>
            <ArrowUpRight size={19} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="catalog-more">
        <p className="eyebrow">LOOKING FOR SOMETHING ELSE?</p>
        <p>Mini Bites and Tartlet Boxes can be requested, too.</p>
        <div className="catalog-more-links">
          <button type="button" onClick={() => onCustom("Mini Bites")}>
            Ask about Mini Bites <ArrowUpRight size={16} />
          </button>
          <button type="button" onClick={() => onCustom("Tartlet Box")}>
            Ask about Tartlet Boxes <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductContent({
  product,
  onView,
  onAddItem,
}: {
  product: ReadyProduct;
  onView: (view: PanelView) => void;
  onAddItem: OrderPanelProps["onAddItem"];
}) {
  const [quantity, setQuantity] = useState(1);
  const [colours, setColours] = useState("");
  const [wording, setWording] = useState("");

  useEffect(() => {
    setQuantity(1);
    setColours("");
    setWording("");
  }, [product.id]);

  return (
    <div className="product-panel">
      <BackButton onClick={() => onView("catalog")}>Back to ready-to-order</BackButton>
      <div className="product-panel-image"><img src={product.image} alt={product.name} /></div>
      <p className="eyebrow">SWEETATION / READY TO ORDER</p>
      <h2 className="drawer-heading">{product.name}</h2>
      <p className="product-includes">{product.includes}</p>
      <p className="drawer-lead">{product.description}</p>
      <div className="product-price">{formatRupiah(product.price)}</div>
      <form
        className="product-options"
        onSubmit={(event) => {
          event.preventDefault();
          onAddItem(product, quantity, colours.trim(), wording.trim());
        }}
      >
        {product.customizable && (
          <>
            <Field label="Preferred colours (optional)">
              <input value={colours} onChange={(event) => setColours(event.target.value)} placeholder="E.g. cream, blush and burgundy" />
            </Field>
            <Field label="Wording (complimentary)">
              <input value={wording} onChange={(event) => setWording(event.target.value)} placeholder="What should we write?" maxLength={80} />
            </Field>
          </>
        )}
        <div className="quantity-row">
          <span>Quantity</span>
          <div className="quantity-control">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button>
            <span>{quantity}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(99, quantity + 1))}><Plus size={15} /></button>
          </div>
        </div>
        <button className="button button-dark button-wide" type="submit">
          Add to bag - {formatRupiah(product.price * quantity)} <ShoppingBag size={17} strokeWidth={1.6} />
        </button>
        <p className="drawer-small-note">Choose your date and delivery or pickup when you finish your order.</p>
      </form>
    </div>
  );
}

function CartContent({
  cart,
  onView,
  onUpdateItem,
  onRemoveItem,
}: {
  cart: CartItem[];
  onView: (view: PanelView) => void;
  onUpdateItem: OrderPanelProps["onUpdateItem"];
  onRemoveItem: OrderPanelProps["onRemoveItem"];
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-content">
      <p className="eyebrow">YOUR SWEET SELECTION</p>
      <h2 className="drawer-heading">Your bag.</h2>
      {cart.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={32} strokeWidth={1.1} />
          <p>Nothing in here yet. Let's change that.</p>
          <button className="button button-dark" type="button" onClick={() => onView("catalog")}>Shop ready-to-order <ArrowRight size={17} /></button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.key}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  {item.colours && <small>Colours: {item.colours}</small>}
                  {item.wording && <small>Wording: {item.wording}</small>}
                  <span>{formatRupiah(item.price)}</span>
                  <div className="cart-item-controls">
                    <div className="quantity-control quantity-control-small">
                      <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => onUpdateItem(item.key, item.quantity - 1)}><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => onUpdateItem(item.key, item.quantity + 1)}><Plus size={13} /></button>
                    </div>
                    <button className="remove-item" type="button" aria-label={`Remove ${item.name}`} onClick={() => onRemoveItem(item.key)}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div><span>Product subtotal</span><strong>{formatRupiah(subtotal)}</strong></div>
            <small>Delivery fee, if applicable, will be confirmed by Sweetation.</small>
            <button className="button button-dark button-wide" type="button" onClick={() => onView("checkout")}>
              Continue to order <ArrowRight size={18} />
            </button>
            <button className="text-link centered-link" type="button" onClick={() => onView("catalog")}>Add something else <ArrowUpRight size={16} /></button>
          </div>
        </>
      )}
    </div>
  );
}

function CommonOrderDetails({ initialEvent }: { initialEvent: string }) {
  const [fulfillment, setFulfillment] = useState("Pickup");

  return (
    <>
      <div className="form-section-label"><span>02</span> YOUR CELEBRATION</div>
      <div className="form-grid">
        <Field label="Event type *">
          <select name="Event type" defaultValue={initialEvent} required>
            <option value="" disabled>Choose an occasion</option>
            {eventOptions.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Required date *">
          <input type="date" name="Required date" min={localToday()} required />
        </Field>
      </div>
      <div className="form-field">
        <span>Delivery or pickup *</span>
        <div className="fulfillment-options">
          {(["Pickup", "Delivery"] as const).map((option) => (
            <label key={option} className={fulfillment === option ? "selected" : ""}>
              <input type="radio" name="Delivery / Pickup" value={option} checked={fulfillment === option} onChange={() => setFulfillment(option)} />
              {option}
              {fulfillment === option && <Check size={15} />}
            </label>
          ))}
        </div>
      </div>
      {fulfillment === "Delivery" && (
        <Field label="Delivery address *">
          <textarea name="Delivery address" rows={2} placeholder="Street address, area and any helpful directions" required />
        </Field>
      )}
      <div className="form-section-label"><span>03</span> HOW TO REACH YOU</div>
      <Field label="Your name *"><input name="Customer name" placeholder="Full name" autoComplete="name" required /></Field>
      <div className="form-grid">
        <Field label="WhatsApp number *"><input name="WhatsApp number" type="tel" placeholder="+62 ..." autoComplete="tel" minLength={8} required /></Field>
        <Field label="Email (optional)"><input name="Email" type="email" placeholder="you@example.com" autoComplete="email" /></Field>
      </div>
    </>
  );
}

function ReferenceUpload({ onChange }: { onChange: (name: string) => void }) {
  const [fileName, setFileName] = useState("");
  return (
    <label className="reference-upload">
      <input
        name="Reference image"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const name = event.target.files?.[0]?.name || "";
          setFileName(name);
          onChange(name);
        }}
      />
      <UploadCloud size={20} strokeWidth={1.4} />
      <span>{fileName || "Add a reference image (optional)"}</span>
      <small>{fileName ? "Choose a different image" : "JPG or PNG. You will attach this in WhatsApp after sending your request."}</small>
    </label>
  );
}

function RequestForm({
  kind,
  cart,
  customContext,
  onPrepared,
  onView,
}: {
  kind: "cake" | "custom" | "checkout";
  cart: CartItem[];
  customContext: CustomContext;
  onPrepared: (request: PreparedRequest) => void;
  onView: (view: PanelView) => void;
}) {
  const [referenceName, setReferenceName] = useState("");
  const isQuote = kind !== "checkout";
  const initialProduct = customContext.product || "Custom Cookies";
  const productOptions = Array.from(new Set([
    initialProduct,
    "Custom Cookies",
    "Custom Cake",
    "Cookie Tower",
    "3D Cookies",
    "Custom Bouquet",
    "Cupcakes",
    "Other sweet creation",
  ]));
  const title = kind === "cake" ? "Build your cake." : kind === "custom" ? "Make it yours." : "Almost there.";
  const intro = kind === "cake"
    ? "Tell us the details and we'll make a cake that feels like your celebration."
    : kind === "custom"
      ? "Share your idea once, beautifully and clearly. We'll take it from there."
      : "Just a few details so we can prepare your sweet order.";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const lines = Array.from(formData.entries())
      .filter(([key, value]) => key !== "Reference image" && typeof value === "string" && value.trim())
      .map(([key, value]) => `${key}: ${value}`);
    const heading = kind === "cake" ? "CAKE ORDER / QUOTE REQUEST" : kind === "custom" ? "CUSTOM QUOTE REQUEST" : "READY-TO-ORDER REQUEST";
    const cartLines = kind === "checkout"
      ? [
          "Products:",
          ...cart.map((item) => `- ${item.name} x ${item.quantity} (${formatRupiah(item.price * item.quantity)})${item.colours ? ` | Colours: ${item.colours}` : ""}${item.wording ? ` | Wording: ${item.wording}` : ""}`),
          `Product subtotal: ${formatRupiah(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}`,
          "",
        ]
      : [];
    const summary = [
      "Hello Sweetation! I'd like to place an order.",
      "",
      heading,
      ...cartLines,
      ...lines,
      ...(referenceName ? [`Reference image: ${referenceName} (I will attach it in this chat)`] : []),
      "",
      isQuote
        ? "I understand final pricing will be confirmed based on the design and requirements. Thank you!"
        : "Please confirm availability and any delivery fee. Thank you!",
    ].join("\n");
    onPrepared({ summary, referenceName: referenceName || undefined });
  }

  return (
    <div className="request-panel">
      <BackButton onClick={() => onView(kind === "checkout" ? "cart" : "chooser")}>
        {kind === "checkout" ? "Back to your bag" : "All ordering options"}
      </BackButton>
      <p className="eyebrow">{kind === "checkout" ? "READY-TO-ORDER" : "MADE JUST FOR YOU"}</p>
      <h2 className="drawer-heading">{title}</h2>
      <p className="drawer-lead">{intro}</p>
      <form className="request-form" onSubmit={handleSubmit}>
        <div className="form-section-label"><span>01</span> {kind === "checkout" ? "YOUR ORDER" : "THE SWEET DETAILS"}</div>
        {kind === "checkout" && (
          <div className="checkout-products">
            {cart.map((item) => (
              <div key={item.key}><span>{item.name} <small>x {item.quantity}</small></span><strong>{formatRupiah(item.price * item.quantity)}</strong></div>
            ))}
            <div className="checkout-total"><span>Product subtotal</span><strong>{formatRupiah(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}</strong></div>
          </div>
        )}
        {kind === "cake" && (
          <>
            <input type="hidden" name="Product" value="Custom Cake" />
            <div className="form-grid">
              <Field label="Cake size *">
                <select name="Size" defaultValue="" required>
                  <option value="" disabled>Choose a size</option>
                  <option>6 inch</option><option>8 inch</option><option>10 inch</option><option>Other / not sure</option>
                </select>
              </Field>
              <Field label="Quantity *"><input name="Quantity" type="number" min="1" defaultValue="1" required /></Field>
              <Field label="Flavour *">
                <select name="Flavour" defaultValue="" required>
                  <option value="" disabled>Choose a flavour</option>
                  <option>Vanilla Bean</option><option>Chocolate</option><option>Red Velvet</option><option>Lemon</option><option>Let's discuss</option>
                </select>
              </Field>
              <Field label="Filling *">
                <select name="Filling" defaultValue="" required>
                  <option value="" disabled>Choose a filling</option>
                  <option>Vanilla cream</option><option>Chocolate ganache</option><option>Strawberry</option><option>Cream cheese</option><option>Let's discuss</option>
                </select>
              </Field>
            </div>
            <div className="form-field">
              <span>Toppers and extras</span>
              <div className="checkbox-options">
                {['Acrylic topper', 'Fresh flowers', 'Candles'].map((option) => (
                  <label key={option}><input name="Topper" type="checkbox" value={option} /> {option}</label>
                ))}
              </div>
            </div>
            <Field label="Add decorated cookies?">
              <select name="Cookie add-on" defaultValue="No cookies">
                <option>No cookies</option><option>6 cookies</option><option>12 cookies</option><option>Let's discuss</option>
              </select>
            </Field>
            <div className="form-grid">
              <Field label="Preferred colours"><input name="Colours" placeholder="E.g. ivory and burgundy" /></Field>
              <Field label="Wording on cake"><input name="Wording" placeholder="Your message" maxLength={80} /></Field>
            </div>
            <Field label="Anything else we should know?"><textarea name="Design details" rows={3} placeholder="The mood, the theme, the little details..." /></Field>
            <ReferenceUpload onChange={setReferenceName} />
          </>
        )}
        {kind === "custom" && (
          <>
            <div className="form-grid">
              <Field label="What are we making? *">
                <select name="Product" defaultValue={initialProduct} required>
                  {productOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="Quantity *"><input name="Quantity" type="number" min="1" defaultValue="1" required /></Field>
              <Field label="Size (if relevant)"><input name="Size" placeholder="Approximate size or servings" /></Field>
              <Field label="Flavour (if relevant)"><input name="Flavour" placeholder="Your preferred flavour" /></Field>
              <Field label="Filling (if relevant)"><input name="Filling" placeholder="Your preferred filling" /></Field>
              <Field label="Colours"><input name="Colours" placeholder="Your colour palette" /></Field>
              <Field label="Wording"><input name="Wording" placeholder="Names, messages, or initials" /></Field>
              <Field label="Add-ons"><input name="Add-ons" placeholder="Bows, toppers, cookies..." /></Field>
            </div>
            <Field label="Tell us what you're imagining *">
              <textarea name="Design details" rows={4} placeholder="The theme, inspiration, shapes, or any detail that matters to you" required />
            </Field>
            <ReferenceUpload onChange={setReferenceName} />
          </>
        )}
        <CommonOrderDetails initialEvent={kind === "custom" ? customContext.occasion : ""} />
        {kind === "checkout" && <Field label="Special notes (optional)"><textarea name="Special notes" rows={3} placeholder="Anything helpful for your order?" /></Field>}
        {isQuote && (
          <p className="quote-note">Final pricing will be confirmed based on your design and requirements.</p>
        )}
        <div className="form-actions">
          <button className="button button-dark button-wide" type="submit">
            {isQuote ? "Request a Quote" : "Review Order Request"} <ArrowRight size={18} />
          </button>
          <small>Your details will be organized into one message before you send it to Sweetation.</small>
        </div>
      </form>
    </div>
  );
}

function PreparedContent({ prepared, onView }: { prepared: PreparedRequest | null; onView: (view: PanelView) => void }) {
  const [copied, setCopied] = useState(false);
  if (!prepared) return null;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(prepared.summary)}`;

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(prepared!.summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="prepared-content">
      <div className="prepared-mark"><Check size={26} strokeWidth={1.5} /></div>
      <p className="eyebrow">ALL THE DETAILS, TOGETHER</p>
      <h2 className="drawer-heading">Your request is ready.</h2>
      <p className="drawer-lead">We've put everything in one clear message. Open WhatsApp to send it directly to Sweetation.</p>
      <div className="prepared-preview"><pre>{prepared.summary}</pre></div>
      {prepared.referenceName && (
        <p className="reference-reminder">Remember to attach <strong>{prepared.referenceName}</strong> in your WhatsApp chat. Images cannot be attached automatically.</p>
      )}
      <a className="button button-dark button-wide" href={whatsappHref} target="_blank" rel="noopener noreferrer">
        Send to Sweetation on WhatsApp <ArrowUpRight size={18} />
      </a>
      <button className="button button-outline-dark button-wide" type="button" onClick={copyDetails}>
        {copied ? "Copied to clipboard" : "Copy request details"} {copied ? <Check size={16} /> : <ChevronRight size={16} />}
      </button>
      <button className="text-link centered-link" type="button" onClick={() => onView("chooser")}>Start another order <ArrowRight size={16} /></button>
    </div>
  );
}

function SearchContent({
  onSelectProduct,
  onCustom,
  onView,
}: {
  onSelectProduct: (product: ReadyProduct) => void;
  onCustom: (product?: string, occasion?: string) => void;
  onView: (view: PanelView) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = [
    { title: "Cakes", group: "Build your order", image: "/images/cakes.jpg", action: () => onView("cake") },
    { title: "Custom Cookies", group: "Request a quote", image: "/images/cookies.jpg", action: () => onCustom("Custom Cookies") },
    { title: "Cupcake Tower", group: "Ready to order", image: "/images/cupcake-tower.jpg", action: () => onSelectProduct(readyProducts[0]) },
    { title: "DIY Cookie Kit", group: "Ready to order", image: "/images/diy-kits.jpg", action: () => onSelectProduct(readyProducts[1]) },
    { title: "Birthday", group: "Shop by occasion", image: "/images/birthday.jpg", action: () => onCustom("Birthday cake or cookies", "Birthday") },
    { title: "Baby Shower", group: "Shop by occasion", image: "/images/baby-shower.jpg", action: () => onCustom("Baby shower desserts", "Baby shower") },
  ].filter((item) => `${item.title} ${item.group}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="search-content">
      <p className="eyebrow">FIND YOUR SWEET</p>
      <h2 className="drawer-heading">What are you looking for?</h2>
      <div className="search-field"><Search size={21} strokeWidth={1.5} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cakes, cookies, occasions..." aria-label="Search products" /></div>
      <p className="search-result-count">{query ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "A few sweet places to begin"}</p>
      <div className="search-results">
        {results.length ? results.map((item) => (
          <button className="search-result" type="button" key={item.title} onClick={item.action}>
            <img src={item.image} alt="" />
            <span><small>{item.group}</small><strong>{item.title}</strong></span>
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </button>
        )) : <p className="search-empty">No exact match. Tell us your idea and we'll make something just for you.</p>}
      </div>
      {!results.length && <button className="button button-dark" type="button" onClick={() => onCustom()}>Start a custom order <ArrowRight size={17} /></button>}
    </div>
  );
}

export default function OrderPanel({
  view,
  selectedProduct,
  cart,
  customContext,
  prepared,
  onClose,
  onView,
  onSelectProduct,
  onCustom,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onPrepared,
}: OrderPanelProps) {
  if (!view) return null;

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={panelLabels[view]}>
        <div className="drawer-top">
          <span className="drawer-wordmark">Sweetation<span>.</span></span>
          <span className="drawer-top-label">{panelLabels[view]}</span>
          <button type="button" className="icon-button drawer-close" aria-label="Close panel" onClick={onClose}><X size={21} strokeWidth={1.6} /></button>
        </div>
        <div className="drawer-scroll" key={view}>
          {view === "chooser" && <ChooserContent onView={onView} onCustom={() => onCustom()} />}
          {view === "catalog" && <CatalogContent onSelectProduct={onSelectProduct} onCustom={(product) => onCustom(product)} onView={onView} />}
          {view === "product" && <ProductContent product={selectedProduct} onView={onView} onAddItem={onAddItem} />}
          {view === "cart" && <CartContent cart={cart} onView={onView} onUpdateItem={onUpdateItem} onRemoveItem={onRemoveItem} />}
          {(view === "cake" || view === "custom" || view === "checkout") && (
            <RequestForm key={`${view}-${customContext.product}-${customContext.occasion}`} kind={view} cart={cart} customContext={customContext} onPrepared={onPrepared} onView={onView} />
          )}
          {view === "prepared" && <PreparedContent prepared={prepared} onView={onView} />}
          {view === "search" && <SearchContent onSelectProduct={onSelectProduct} onCustom={onCustom} onView={onView} />}
        </div>
      </aside>
    </div>
  );
}