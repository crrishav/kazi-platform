export interface Product {
  id: string;
  slug: string;
  name: string;
  price: string;
  image: string;
  garment: 't-shirt' | 'hoodie';
  colors?: { name: string; hex: string }[];
  badge?: string;
  description: string;
  collection: 'featured' | 'men' | 'women';
  details: string[];
  sustainability: string[];
  sizeFit: string[];
}

export const products: Product[] = [
  // Homepage Featured Products
  {
    id: "kazi-organic-tee",
    slug: "kazi-organic-tee",
    name: "KAZI ORGANIC TEE",
    price: "From US$ 8.50 / piece",
    image: "/images/organic-tee.jpg",
    garment: "t-shirt",
    colors: [
      { name: "Forest Green", hex: "#1B3D2A" },
      { name: "Sage", hex: "#8FA89B" },
      { name: "Bone White", hex: "#EBF3EC" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    description: "A premium crew neck t-shirt crafted from GOTS certified organic cotton. Features a tailored yet comfortable silhouette designed for everyday luxury.",
    collection: "featured",
    details: [
      "Classic crew neck cut",
      "Ribbed collar detailing",
      "Reinforced shoulder-to-shoulder taping",
      "Double-needle stitched hems"
    ],
    sustainability: [
      "100% GOTS certified organic cotton jersey",
      "180 gsm mid-weight knit fabric",
      "Low impact, non-toxic dyes",
      "Handcrafted in a certified ethical workspace in Nepal"
    ],
    sizeFit: [
      "Fits true to size",
      "Standard straight cut silhouette",
      "Pre-washed to minimize shrinkage",
      "Model is 6'1\" wearing size L"
    ]
  },
  {
    id: "dropshoulder-tee",
    slug: "dropshoulder-tee",
    name: "DROPSHOULDER TEE",
    price: "From US$ 12.00 / piece",
    image: "/images/dropshoulder-tee.jpg",
    garment: "t-shirt",
    colors: [
      { name: "Deep Green", hex: "#1B3D2A" },
      { name: "Olive", hex: "#6B6B4E" },
      { name: "Navy", hex: "#1A2744" },
      { name: "Off-White", hex: "#EBF3EC" },
    ],
    description: "An elevated basic featuring an oversized drape and drop-shoulder seam. Built for a relaxed streetwear silhouette without compromising on premium fabric feel.",
    collection: "featured",
    details: [
      "Relaxed drop-shoulder sleeves",
      "Wide neck band detail",
      "Thick premium knit structure",
      "Slightly boxy cropped hemline"
    ],
    sustainability: [
      "100% premium Nepalese long-staple cotton",
      "220 gsm heavyweight structure",
      "Naturally softened with mineral washes",
      "Fair-wage production by Kathmandu artisans"
    ],
    sizeFit: [
      "Oversized/Relaxed fit",
      "We recommend taking your normal size for the intended drape",
      "Drapes elegantly over the shoulders",
      "Model is 5'10\" wearing size M"
    ]
  },
  {
    id: "premium-hoodie",
    slug: "premium-hoodie",
    name: "PREMIUM HOODIE",
    price: "From US$ 18.00 / piece",
    image: "/images/premium-hoodie.jpg",
    garment: "hoodie",
    badge: "BESTSELLER",
    colors: [
      { name: "Cream", hex: "#F5F3EE" },
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "The ultimate heavyweight pullover hoodie. Expertly crafted from loopback french terry, providing superior comfort, structure, and insulation.",
    collection: "featured",
    details: [
      "Double-lined spacious hood",
      "No drawcords for a clean, architectural front",
      "Ribbed cuffs and waistband with elastane recovery",
      "Spacious kangaroo pouch pocket"
    ],
    sustainability: [
      "80% organic cotton, 20% recycled polyester fleece",
      "380 gsm heavyweight brushed back knit",
      "Durable flatlock seam construction",
      "Sourced and constructed ethically in Kathmandu, Nepal"
    ],
    sizeFit: [
      "Structured, boxy silhouette",
      "Provides premium weight and warmth",
      "Fits true to size",
      "Model is 6'2\" wearing size L"
    ]
  },
  {
    id: "organic-overshirt",
    slug: "organic-overshirt",
    name: "ORGANIC OVERSHIRT",
    price: "From US$ 22.00 / piece",
    image: "/images/product-weekend.jpg",
    garment: "t-shirt",
    badge: "GENDER NEUTRAL",
    colors: [
      { name: "Forest", hex: "#2C4A3E" },
      { name: "Sage", hex: "#556B2F" },
      { name: "Rust", hex: "#8B4513" },
    ],
    description: "A structured button-down overshirt made from durable organic cotton twill. Works perfectly as a layering piece or a standalone jacket.",
    collection: "featured",
    details: [
      "Unstructured collar",
      "Sustainable coconut-shell buttons",
      "Dual chest patch pockets",
      "Clean double-stitch construction"
    ],
    sustainability: [
      "100% organic cotton drill twill",
      "280 gsm durable mid-weight fabric",
      "No synthetic blends",
      "Dyed with plant-based botanical pigments"
    ],
    sizeFit: [
      "Regular fit designed for layering",
      "Straight hemline cut",
      "Roomy through the chest and arms",
      "Model is 6'0\" wearing size L"
    ]
  },

  // Men's Collection
  {
    id: "organic-crew-tee",
    slug: "organic-crew-tee",
    name: "Organic Crew Tee",
    price: "From £75",
    image: "/images/product-wrap.jpg",
    garment: "t-shirt",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Cream", hex: "#F5F3EE" },
      { name: "Stone", hex: "#6B6560" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "Classic cut organic cotton crew neck t-shirt. Simple, robust, and beautifully finished for everyday wear.",
    collection: "men",
    details: [
      "Standard set-in sleeves",
      "1.5cm rib collar",
      "Blind-stitched hems",
      "Pre-shrunk fabric"
    ],
    sustainability: [
      "100% GOTS organic cotton",
      "Nepali solar-powered knitting factory production",
      "Water-based zero-impact dyes",
      "Traceable from farm to closet"
    ],
    sizeFit: [
      "Standard fit",
      "True to size",
      "Model is 6'1\" wearing size M"
    ]
  },
  {
    id: "essential-hoodie",
    slug: "essential-hoodie",
    name: "Essential Hoodie",
    price: "From £87",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Sand", hex: "#B8A898" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "Your new go-to hoodie. Clean lines, a comfortable fit, and thick loopback french terry make this a versatile classic.",
    collection: "men",
    details: [
      "Double-layered hood",
      "Metal-tipped cotton drawcords",
      "Raglan sleeves for shoulder comfort",
      "Ribbed side panels"
    ],
    sustainability: [
      "100% organic cotton loopback french terry",
      "Nepali artisan craftsmanship",
      "Plastic-free trims",
      "Locally sourced and produced"
    ],
    sizeFit: [
      "Relaxed regular fit",
      "Fits true to size",
      "Model is 6'0\" wearing size M"
    ]
  },
  {
    id: "dropshoulder-pocket-tee",
    slug: "dropshoulder-pocket-tee",
    name: "Dropshoulder Pocket Tee",
    price: "From £99",
    image: "/images/product-kebaya-black.jpg",
    garment: "t-shirt",
    colors: [
      { name: "Linen", hex: "#D4C5A9" },
      { name: "Olive", hex: "#6B6B4E" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "An oversized pocket t-shirt featuring dropped shoulder lines and a roomy chest pocket. The heavy drape adds structural presence.",
    collection: "men",
    details: [
      "Dropped shoulders",
      "Clean chest patch pocket",
      "Heavyweight structure",
      "Thick neck ribbing"
    ],
    sustainability: [
      "100% GOTS organic cotton",
      "Heavyweight 220 gsm jersey knit",
      "Ethically made by Himalayan partners",
      "Carbon-neutral shipping"
    ],
    sizeFit: [
      "Oversized fit",
      "Take your normal size for a relaxed look, size down for standard fit",
      "Model is 6'1\" wearing size L"
    ]
  },
  {
    id: "heavyweight-pullover",
    slug: "heavyweight-pullover",
    name: "Heavyweight Pullover",
    price: "From £111",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Stone", hex: "#6B6560" },
      { name: "Forest", hex: "#2C4A3E" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "A super-heavy pullover sweatshirt designed for maximum structure and warmth. Heavyweight fleece fabric retains shape and softens with age.",
    collection: "men",
    details: [
      "Heavyweight loopback fleece",
      "Ribbed crew neck insert",
      "Heavy rib cuffs and hem",
      "Flatlock stitching throughout"
    ],
    sustainability: [
      "80% organic cotton, 20% recycled polyester",
      "380 gsm heavyweight fleece",
      " Nepal handicraft certified",
      "Low water usage dyeing process"
    ],
    sizeFit: [
      "Boxy heavyweight fit",
      "Provides a structured, clean outline",
      "Model is 6'2\" wearing size L"
    ]
  },
  {
    id: "classic-v-neck",
    slug: "classic-v-neck",
    name: "Classic V-Neck",
    price: "From £123",
    image: "/images/product-wrap.jpg",
    garment: "t-shirt",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Navy", hex: "#1A2744" },
    ],
    description: "A shallow V-neck t-shirt with a refined fit. Made from breathable jersey cotton that is cool on the skin.",
    collection: "men",
    details: [
      "Shallow V-neck design",
      "Flat-lock side seams",
      "Fine cotton ribbing on neck",
      "Lightweight feel"
    ],
    sustainability: [
      "100% fine organic cotton",
      "GOTS and OEKO-TEX certified",
      "Produced under fair trade conditions in Nepal",
      "Biodegradable natural fibers"
    ],
    sizeFit: [
      "Slim to regular fit",
      "True to size",
      "Model is 5'11\" wearing size M"
    ]
  },
  {
    id: "zip-up-hoodie",
    slug: "zip-up-hoodie",
    name: "Zip-Up Hoodie",
    price: "From £135",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Sage", hex: "#556B2F" },
      { name: "Stone", hex: "#6B6560" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "An elegant full-zip hoodie featuring a premium YKK metal zipper. Perfect for layering, built from durable mid-weight terry.",
    collection: "men",
    details: [
      "Two-way YKK front zipper",
      "Split kangaroo pocket",
      "Self-fabric lined hood",
      "Double needle cover-stitch"
    ],
    sustainability: [
      "100% organic cotton terry",
      " Nepali partner workshop made",
      "Metal elements sourced from recycled copper",
      "Naturally softened with organic enzymes"
    ],
    sizeFit: [
      "Regular fit",
      "Excellent layering piece",
      "Model is 6'0\" wearing size L"
    ]
  },
  {
    id: "oversized-tee",
    slug: "oversized-tee",
    name: "Oversized Tee",
    price: "From £147",
    image: "/images/product-weekend.jpg",
    garment: "t-shirt",
    colors: [
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Rust", hex: "#8B4513" },
      { name: "Sage", hex: "#556B2F" },
    ],
    description: "An ultra-oversized tee with a wide silhouette and long sleeves. A standard-setter for the relaxed contemporary aesthetic.",
    collection: "men",
    details: [
      "Wide boxy body",
      "Longer elbow-length sleeves",
      "Seamless side-seam construction",
      "Extra wide neckline"
    ],
    sustainability: [
      "100% heavyweight GOTS organic cotton",
      " Nepal rural community group production",
      "Eco-friendly washing cycle",
      "Zero waste cutting pattern"
    ],
    sizeFit: [
      "Very oversized fit",
      "Size down for a closer fit, or take normal size for maximum drape",
      "Model is 6'2\" wearing size M"
    ]
  },
  {
    id: "quarter-zip-fleece",
    slug: "quarter-zip-fleece",
    name: "Quarter-Zip Fleece",
    price: "From £159",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Forest", hex: "#2C4A3E" },
      { name: "Sand", hex: "#B8A898" },
      { name: "Oat", hex: "#E8E0D0" },
    ],
    description: "A comfortable stand-collar pullover with a 1/4 zip closure. Combines high warmth with structural elegance.",
    collection: "men",
    details: [
      "Stand collar design",
      "Quarter-zip premium brass closure",
      "Elasticated cuffs",
      "Concealed side pockets"
    ],
    sustainability: [
      "Recycled cotton and organic polyester blend fleece",
      " Nepal solar knitting mills product",
      "Recycled brass metal hardware",
      "100% transparent production path"
    ],
    sizeFit: [
      "Standard casual fit",
      "Comfortable under a jacket or as standalone layer",
      "Model is 6'1\" wearing size M"
    ]
  },

  // Women's Collection
  {
    id: "artisan-crew-tee",
    slug: "artisan-crew-tee",
    name: "Artisan Crew Tee",
    price: "From £85",
    image: "/images/product-wrap.jpg",
    garment: "t-shirt",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Cream", hex: "#F5F3EE" },
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Sage", hex: "#556B2F" },
    ],
    description: "An elegant, softly tailored crew neck tee. Created using Nepal's finest organic yarn, resulting in a featherlight, breathable jersey.",
    collection: "women",
    details: [
      "Slimmer, refined crew neck",
      "Slightly cropped sleeve length",
      "Fine double stitch hemline",
      "Interlock knit structure"
    ],
    sustainability: [
      "100% fine GOTS organic cotton",
      "Hand-finished by women co-ops in Kathmandu",
      "Pure rainwater harvesting dyeing process",
      "Fully biodegradable packaging"
    ],
    sizeFit: [
      "Refined feminine fit",
      "Fits true to size",
      "Model is 5'8\" wearing size S"
    ]
  },
  {
    id: "relaxed-hoodie",
    slug: "relaxed-hoodie",
    name: "Relaxed Hoodie",
    price: "From £100",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Cream", hex: "#F5F3EE" },
      { name: "Sand", hex: "#B8A898" },
      { name: "Stone", hex: "#6B6560" },
    ],
    description: "A relaxed, elegant hoodie with a soft hand-feel. Features drop shoulders and a clean visual line with no front cords.",
    collection: "women",
    details: [
      "Clean, cord-free front hood",
      "Soft drop shoulder seam",
      "Ribbed side inserts for flexibility",
      "Deep cosy front pocket"
    ],
    sustainability: [
      "90% organic cotton, 10% Nepalese nettle fiber blend",
      "Zero waste cutting scheme",
      "Fair trade certified by Kathmandu Guild",
      "Natural unbleached colors available"
    ],
    sizeFit: [
      "Relaxed flowy drape",
      "For a tighter fit, size down",
      "Model is 5'9\" wearing size S"
    ]
  },
  {
    id: "cropped-pocket-tee",
    slug: "cropped-pocket-tee",
    name: "Cropped Pocket Tee",
    price: "From £115",
    image: "/images/product-kebaya-black.jpg",
    garment: "t-shirt",
    colors: [
      { name: "Linen", hex: "#D4C5A9" },
      { name: "Rust", hex: "#8B4513" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "A boxy, slightly cropped t-shirt with a neat breast pocket. The structural heavyweight fabric holds its clean shape beautifully.",
    collection: "women",
    details: [
      "Boxy cropped cut",
      "Re-enforced chest pocket",
      "Thick raw-edge trim look",
      "Breathable weave"
    ],
    sustainability: [
      "100% organic Kathmandu cotton",
      "Heavyweight 210 gsm knit",
      "Handcrafted by Nepalese artisans",
      "Dyed with natural wild madder root (Rust)"
    ],
    sizeFit: [
      "Boxy cropped fit",
      "Designed to fall just at the waistband line",
      "Model is 5'7\" wearing size S"
    ]
  },
  {
    id: "oversized-pullover",
    slug: "oversized-pullover",
    name: "Oversized Pullover",
    price: "From £130",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Forest", hex: "#2C4A3E" },
      { name: "Cream", hex: "#F5F3EE" },
    ],
    description: "An oversized crew neck pullover. Features extra volume through the body and sleeves, finishing with a snug ribbed waistband.",
    collection: "women",
    details: [
      "Voluminous balloon-style sleeves",
      "Snug high-recovery rib hem",
      "Drop-shoulder construction",
      "Thick cozy loopback backing"
    ],
    sustainability: [
      "100% organic cotton French Terry",
      "Nepal solar-powered knitting factory certified",
      "Sustainably washed with local botanicals",
      "Fully compostable garment tag"
    ],
    sizeFit: [
      "Oversized relaxed fit",
      "Model is 5'9\" wearing size S for intended volume"
    ]
  },
  {
    id: "fitted-v-neck",
    slug: "fitted-v-neck",
    name: "Fitted V-Neck",
    price: "From £145",
    image: "/images/product-wrap.jpg",
    garment: "t-shirt",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Sand", hex: "#B8A898" },
    ],
    description: "A sleek, fitted V-neck tee made from rib-knit organic cotton. Perfect as a base layer or standalone top.",
    collection: "women",
    details: [
      "Refined V-neck collar line",
      "Body-skimming tailored fit",
      "Rib-knit stretchy fabric",
      "Double layer front panel"
    ],
    sustainability: [
      "95% GOTS organic cotton, 5% natural elastane",
      "Eco-wash soft finish",
      "Fair wage Nepalese cooperative sewing",
      "Zero synthetic polyester blends"
    ],
    sizeFit: [
      "Tailored fitted shape",
      "Form-fitting with comfortable stretch",
      "Model is 5'8\" wearing size S"
    ]
  },
  {
    id: "boxy-zip-hoodie",
    slug: "boxy-zip-hoodie",
    name: "Boxy Zip Hoodie",
    price: "From £160",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Stone", hex: "#6B6560" },
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    description: "A short, boxy full-zip hoodie with dropped shoulders and a heavy metal zip. Easy comfort combined with casual structure.",
    collection: "women",
    details: [
      "Cropped boxy cut",
      "Double lining architectural hood",
      "Premium silver zipper puller",
      "Wide ribbed cuffs"
    ],
    sustainability: [
      "100% organic cotton fleece",
      "Nepalese craft workspace assembly",
      "Naturally washed to avoid chemical softeners",
      "Recycled silver zipper hardware"
    ],
    sizeFit: [
      "Wide boxy fit, slightly cropped",
      "Model is 5'8\" wearing size S"
    ]
  },
  {
    id: "longline-tee",
    slug: "longline-tee",
    name: "Longline Tee",
    price: "From £175",
    image: "/images/product-weekend.jpg",
    garment: "t-shirt",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sage", hex: "#556B2F" },
      { name: "Linen", hex: "#D4C5A9" },
    ],
    description: "An elegant, lengthened t-shirt dress or longline tee. Soft slub organic cotton flows beautifully for a casual look.",
    collection: "women",
    details: [
      "Lengthened straight hem",
      "High side split detailing",
      "Refined boat neck line",
      "Slub knit organic cotton"
    ],
    sustainability: [
      "100% GOTS organic slub cotton",
      " Nepal co-op craft, fair-trade guaranteed",
      "Zero petrochemical processing",
      "Low impact mineral washed"
    ],
    sizeFit: [
      "Loose, longline drape",
      "Falls to mid-thigh",
      "Model is 5'10\" wearing size S"
    ]
  },
  {
    id: "heavyweight-fleece",
    slug: "heavyweight-fleece",
    name: "Heavyweight Fleece",
    price: "From £190",
    image: "/images/product-kebaya-cream.jpg",
    garment: "hoodie",
    colors: [
      { name: "Forest", hex: "#2C4A3E" },
      { name: "Oat", hex: "#E8E0D0" },
      { name: "Rust", hex: "#8B4513" },
    ],
    description: "Our warmest crew neck sweatshirt. Made from a thick loopback cotton fleece that traps heat while maintaining a structured look.",
    collection: "women",
    details: [
      "Stand collar high crew neck",
      "Extra-thick loopback fleece",
      "Underarm venting stitch",
      "Deep ribbed cuff detailing"
    ],
    sustainability: [
      "85% organic cotton, 15% recycled polyester fleece",
      "380 gsm dense weave",
      "Ethically made in Kathmandu",
      "Low carbon emissions transportation chain"
    ],
    sizeFit: [
      "Structured regular fit",
      "Heavyweight dense fit",
      "Model is 5'9\" wearing size S"
    ]
  }
];
