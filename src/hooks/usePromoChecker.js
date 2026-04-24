// src/hooks/usePromoChecker.js

// ── Jelly product names ───────────────────
export const JELLY_PRODUCTS = [
  "MAMA'S LOVE COCOA 150g*48",
  "NOVA JELLY 125g*48",
  "NOVA JELLY 275g*24",
  "NOVA JELLY 450g*12",
  "PRINCESS JELLY 80g*72",
  "MAMA'S LOVE JELLY 150g*48",
  "CLASSY JELLY 100g*48",
];

// ── Beverage category check ───────────────
export const BEVERAGE_KEYWORDS = [
  "POP ", "INFINITE POWER", "ZIZOU",
  "WATER", "FIZZY", "POWER",
];

// ── Care category check ───────────────────
export const CARE_KEYWORDS = [
  "TOO CLEAN", "MAMA JOY", "MAMUDA",
  "NOVA ", "CLASSY SOAP", "SHE SOAP",
  "SHE SHEA", "SHE ROYAL", "MAMA'S LOVE",
  "MAMA'S JOY SOAP", "MULTIPURPOSE",
];

// ── Check if product is a jelly ───────────
export const isJellyProduct = (name) =>
  JELLY_PRODUCTS.some(
    (j) => name?.toUpperCase() === j.toUpperCase()
  );

// ── Check if product is a beverage ───────
export const isBeverageProduct = (name) =>
  BEVERAGE_KEYWORDS.some((k) =>
    name?.toUpperCase().includes(k.toUpperCase())
  );

// ── Check if product is a care product ───
export const isCareProduct = (name) =>
  CARE_KEYWORDS.some((k) =>
    name?.toUpperCase().includes(k.toUpperCase())
  );

// ── Main checker function ─────────────────
export const checkPromos = (cartItems) => {
  const triggered = [];

  cartItems.forEach((item) => {
    const name = item.name || "";
    const qty = item.quantity || 0;

    // PROMO 1: Jelly — buy 25, get 1 free
    if (isJellyProduct(name) && qty >= 25) {
      const promoKey = `jelly_${name}`;
      triggered.push({
        key: promoKey,
        type: "jelly_promo",
        emoji: "🍯",
        title: "Jelly Promo Unlocked!",
        description: `You've added ${qty} cartons of ${name}. You qualify for our Buy 25 Get 1 FREE promo!`,
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

    // PROMO 2: Power Mint — buy 25, get 1 free
    if (
      name?.toUpperCase().includes("POWER MINT") &&
      qty >= 25
    ) {
      triggered.push({
        key: "power_mint_promo",
        type: "power_mint_promo",
        emoji: "🌿",
        title: "Power Mint Promo Unlocked!",
        description: `Amazing! You've added ${qty} cartons of Power Mint. You qualify for 1 FREE carton!`,
        rewardText: "1 FREE carton of POWER MINT",
        freeItem: {
          name: item.name,
          image: item.image,
          price: 0,
          quantity: 1,
          productId: item.productId,
          slug: item.slug,
          isPromo: true,
          promoTag: "🎁 FREE - Power Mint Promo",
        },
      });
    }

    // PROMO 3: Beverage — buy 500 packs, get 5% free
    if (isBeverageProduct(name) && qty >= 500) {
      const fivePercent = Math.floor(qty * 0.05);
      triggered.push({
        key: "beverage_promo",
        type: "beverage_promo",
        emoji: "🥤",
        title: "Beverage Promo Unlocked!",
        description: `Wow! You've added ${qty} packs of beverages. You qualify for 5% FREE in beverage stock!`,
        rewardText: `${fivePercent} FREE packs — choose any beverages!`,
        freeQty: fivePercent,
        redirectTo: "/all-products?category=beverage&promo=true",
      });
    }

    // PROMO 4: Care — buy 300, get 3% free
    if (isCareProduct(name) && qty >= 300) {
      const threePercent = Math.floor(qty * 0.03);
      triggered.push({
        key: "care_promo",
        type: "care_promo",
        emoji: "🧴",
        title: "Care Products Promo!",
        description: `Fantastic! You've added ${qty} units of care products. You qualify for 3% FREE in care stock!`,
        rewardText: `${threePercent} FREE units — choose any care products!`,
        freeQty: threePercent,
        redirectTo: "/all-products?category=care&promo=true",
      });
    }
  });

  return triggered;
};