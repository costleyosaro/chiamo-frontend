// src/hooks/usePromoChecker.js

const IK = "https://ik.imagekit.io/ljwnlcbqyu";

// ── Product Lists ─────────────────────────
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
    (j) => name?.toUpperCase().trim() === j.toUpperCase().trim()
  );

export const isBeverageProduct = (name) => {
  const BEVERAGE_KEYWORDS = [
    "POP ", "INFINITE POWER", "ZIZOU", "FIZZY",
  ];
  return BEVERAGE_KEYWORDS.some((k) =>
    name?.toUpperCase().includes(k.toUpperCase())
  );
};

export const isCareProduct = (name) => {
  const CARE_KEYWORDS = [
    "TOO CLEAN", "MAMA JOY", "MAMUDA BROWN",
    "MAMUDA PINK", "MAMUDA GOLD",
    "NOVA COOL", "NOVA PINK", "NOVA BLUE",
    "NOVA PURPLE", "NOVA JASMINE", "NOVA ROYAL",
    "NOVA AVOCADO", "NOVA PAPAYA",
    "CLASSY SOAP", "SHE SOAP", "SHE SHEA",
    "SHE ROYAL", "MAMA'S LOVE ORANGE",
    "MAMA'S LOVE PINK", "MAMA'S LOVE BLUE",
    "MAMA'S JOY SOAP", "MULTIPURPOSE",
  ];
  return CARE_KEYWORDS.some((k) =>
    name?.toUpperCase().includes(k.toUpperCase())
  );
};

// ── LocalStorage Helpers ──────────────────
const PROMO_STORAGE_KEY = "chiamoorder_claimed_promos";

export const getClaimedPromos = () => {
  try {
    return JSON.parse(
      localStorage.getItem(PROMO_STORAGE_KEY) || "[]"
    );
  } catch {
    return [];
  }
};

export const saveClaimedPromo = (promoKey) => {
  const existing = getClaimedPromos();
  if (!existing.includes(promoKey)) {
    localStorage.setItem(
      PROMO_STORAGE_KEY,
      JSON.stringify([...existing, promoKey])
    );
  }
};

export const isPromoClaimed = (promoKey) =>
  getClaimedPromos().includes(promoKey);

// ── Main Checker ──────────────────────────
export const checkPromos = (cartItems) => {
  const triggered = [];

  cartItems.forEach((item) => {
    const name = item.name || "";
    const qty  = item.quantity || 0;

    // ── PROMO 1: Any Jelly → Buy 25 Get 1 FREE ──
    if (isJellyProduct(name) && qty >= 25) {
      const key = `jelly_${name.replace(/\s+/g, "_")}`;
      if (!isPromoClaimed(key)) {
        triggered.push({
          key,
          type: "jelly_promo",
          iconType: "gift",          // ✅ used by PromoModal to pick icon
          title: "Jelly Promo Unlocked",
          description:
            `You have added ${qty} cartons of ${name} and qualify for the Buy 25 Get 1 FREE offer.`,
          rewardText: `1 FREE carton of ${name}`,
          freeItem: {
            name:      item.name,
            image:     item.image,
            price:     0,
            quantity:  1,
            // ✅ FIXED: multiple fallbacks so identifier is never null
            productId: item.productId ?? item.id ?? null,
            slug:      item.slug ?? item.raw?.slug ?? null,
            isPromo:   true,
            promoTag:  "FREE — Jelly Promo",
          },
        });
      }
    }

    // ── PROMO 2: Power Mint → Buy 25 Get 1 FREE ──
    if (name?.toUpperCase().includes("POWER MINT") && qty >= 25) {
      const key = "power_mint_promo";
      if (!isPromoClaimed(key)) {
        triggered.push({
          key,
          type: "power_mint_promo",
          iconType: "leaf",          // ✅ used by PromoModal to pick icon
          title: "Power Mint Promo Unlocked",
          description:
            `You have added ${qty} cartons of Power Mint and qualify for 1 FREE carton.`,
          rewardText: "1 FREE carton of POWER MINT",
          freeItem: {
            name:      item.name,
            image:     `${IK}/food/Food23-sweet.png?updatedAt=1771851133865`,
            price:     0,
            quantity:  1,
            // ✅ FIXED: multiple fallbacks
            productId: item.productId ?? item.id ?? null,
            slug:      item.slug ?? item.raw?.slug ?? null,
            isPromo:   true,
            promoTag:  "FREE — Power Mint Promo",
          },
        });
      }
    }

    // ── PROMO 3: Beverage → 500 Packs = 5% FREE ──
    if (isBeverageProduct(name) && qty >= 500) {
      const key = `beverage_${name.replace(/\s+/g, "_")}`;
      if (!isPromoClaimed(key)) {
        const fivePercent = Math.floor(qty * 0.05);
        triggered.push({
          key,
          type: "beverage_promo",
          iconType: "box",           // ✅ used by PromoModal to pick icon
          title: "Beverage Bonus Unlocked",
          description:
            `You have added ${qty} packs of ${name} and qualify for 5% FREE stock.`,
          rewardText: `${fivePercent} FREE packs — select any beverages`,
          freeQty: fivePercent,
          redirectTo:
            "/all-products?category=beverage&promo=beverage_500",
        });
      }
    }

    // ── PROMO 4: Care → 300 Units = 3% FREE ──
    if (isCareProduct(name) && qty >= 300) {
      const key = `care_${name.replace(/\s+/g, "_")}`;
      if (!isPromoClaimed(key)) {
        const threePercent = Math.floor(qty * 0.03);
        triggered.push({
          key,
          type: "care_promo",
          iconType: "shield",        // ✅ used by PromoModal to pick icon
          title: "Care Products Promo Unlocked",
          description:
            `You have added ${qty} units of ${name} and qualify for 3% FREE care products.`,
          rewardText: `${threePercent} FREE units — select any care products`,
          freeQty: threePercent,
          redirectTo:
            "/all-products?category=care&promo=care_300",
        });
      }
    }
  });

  return triggered;
};