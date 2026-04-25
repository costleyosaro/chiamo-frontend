// src/hooks/usePromoChecker.js

export const JELLY_PRODUCTS = [
  "MAMA'S LOVE COCOA 150g*48",
  "NOVA JELLY 125g*48",
  "NOVA JELLY 275g*24",
  "NOVA JELLY 450g*12",
  "PRINCESS JELLY 80g*72",
  "MAMA'S LOVE JELLY 150g*48",
  "CLASSY JELLY 100g*48",
];

export const isJellyProduct = (name) =>
  JELLY_PRODUCTS.some(
    (j) => name?.toUpperCase() === j.toUpperCase()
  );

export const isBeverageProduct = (name) => {
  const BEVERAGE_KEYWORDS = [
    "POP ", "INFINITE POWER", "ZIZOU",
    "WATER", "FIZZY",
  ];
  return BEVERAGE_KEYWORDS.some((k) =>
    name?.toUpperCase().includes(k.toUpperCase())
  );
};

export const isCareProduct = (name) => {
  const CARE_KEYWORDS = [
    "TOO CLEAN", "MAMA JOY", "MAMUDA",
    "NOVA COOL", "NOVA PINK", "NOVA BLUE",
    "NOVA PURPLE", "NOVA JASMINE", "NOVA ROYAL",
    "CLASSY SOAP", "SHE SOAP", "SHE SHEA",
    "SHE ROYAL", "MAMA'S LOVE ORANGE",
    "MAMA'S LOVE PINK", "MAMA'S LOVE BLUE",
    "MAMA'S JOY SOAP", "MULTIPURPOSE",
  ];
  return CARE_KEYWORDS.some((k) =>
    name?.toUpperCase().includes(k.toUpperCase())
  );
};

export const checkPromos = (cartItems) => {
  const triggered = [];
  const IK = "https://ik.imagekit.io/ljwnlcbqyu";

  cartItems.forEach((item) => {
    const name = item.name || "";
    const qty = item.quantity || 0;

    // ── PROMO 1: Jelly — buy 25 get 1 free ──
    if (isJellyProduct(name) && qty >= 25) {
      triggered.push({
        key: `jelly_${name}`,
        type: "jelly_promo",
        emoji: "🍯",
        title: "Jelly Promo Unlocked!",
        description: `You've added ${qty} cartons of ${name}. Qualify for Buy 25 Get 1 FREE!`,
        rewardText: `1 FREE carton of ${name}`,
        freeItem: {
          name: item.name,
          image: item.image,
          price: 0,
          quantity: 1,
          productId: item.productId,
          slug: item.slug,
          isPromo: true,
          promoTag: "🎁 FREE - Jelly Promo",
        },
      });
    }

    // ── PROMO 2: Power Mint — buy 25 get 1 free ──
    if (
      name?.toUpperCase().includes("POWER MINT") &&
      qty >= 25
    ) {
      triggered.push({
        key: "power_mint_promo",
        type: "power_mint_promo",
        emoji: "🌿",
        title: "Power Mint Promo Unlocked!",
        description: `Amazing! ${qty} cartons of Power Mint added. You qualify for 1 FREE carton!`,
        rewardText: "1 FREE carton of POWER MINT",
        freeItem: {
          name: item.name,
          image: `${IK}/food/Food23-sweet.png?updatedAt=1771851133865`,
          price: 0,
          quantity: 1,
          productId: item.productId,
          slug: item.slug,
          isPromo: true,
          promoTag: "🎁 FREE - Power Mint Promo",
        },
      });
    }

    // ── PROMO 3: Beverage — 500 packs = 5% free ──
    if (isBeverageProduct(name) && qty >= 500) {
      const fivePercent = Math.floor(qty * 0.05);
      triggered.push({
        key: `beverage_${name}`,
        type: "beverage_promo",
        emoji: "🥤",
        title: "Beverage Promo Unlocked!",
        description: `Wow! ${qty} packs of ${name} added. You qualify for 5% FREE in beverage stock!`,
        rewardText: `${fivePercent} FREE packs — choose any beverages!`,
        freeQty: fivePercent,
        redirectTo: "/all-products?category=beverage&promo=beverage_500",
      });
    }

    // ── PROMO 4: Care — 300 units = 3% free ──
    if (isCareProduct(name) && qty >= 300) {
      const threePercent = Math.floor(qty * 0.03);
      triggered.push({
        key: `care_${name}`,
        type: "care_promo",
        emoji: "🧴",
        title: "Care Products Promo!",
        description: `Fantastic! ${qty} units of ${name} added. You qualify for 3% FREE care products!`,
        rewardText: `${threePercent} FREE units — choose any care products!`,
        freeQty: threePercent,
        redirectTo: "/all-products?category=care&promo=care_300",
      });
    }
  });

  return triggered;
};