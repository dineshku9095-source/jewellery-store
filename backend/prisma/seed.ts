import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const IMG = {
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
  pendant: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
  bangles: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
  gemRing: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800",
  earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
  pearls: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
  necklace: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800",
  gold: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800",
  chain: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
  bracelet: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800",
  hero: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200",
};

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@jewellerystore.local";
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "ChangeMe-Dev-Only-12chars";

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Store Admin",
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {
      storeName: "Queen's Jewels Aura",
      tagline: "Every piece of jewellery tells a story",
    },
    create: {
      id: 1,
      storeName: "Queen's Jewels Aura",
      tagline: "Every piece of jewellery tells a story",
      contactEmail: "hello@queensjewelsaura.example",
      contactPhone: "+919876543210",
      whatsappNumber: "919876543210",
      address: "12 Heritage Lane, Mumbai",
      currency: "INR",
    },
  });

  const rings = await prisma.category.upsert({
    where: { slug: "rings" },
    update: {},
    create: {
      name: "Rings",
      slug: "rings",
      description: "Statement and everyday rings",
    },
  });

  const necklaces = await prisma.category.upsert({
    where: { slug: "necklaces" },
    update: {},
    create: {
      name: "Necklaces",
      slug: "necklaces",
      description: "Necklaces and pendants",
    },
  });

  const earrings = await prisma.category.upsert({
    where: { slug: "earrings" },
    update: {},
    create: {
      name: "Earrings",
      slug: "earrings",
      description: "Hoops, studs, and drops",
    },
  });

  const bracelets = await prisma.category.upsert({
    where: { slug: "bracelets" },
    update: {},
    create: {
      name: "Bracelets",
      slug: "bracelets",
      description: "Bangles and bracelets",
    },
  });

  const bridal = await prisma.collection.upsert({
    where: { slug: "bridal-edit" },
    update: {},
    create: {
      name: "Bridal Edit",
      slug: "bridal-edit",
      description: "Curated for celebrations",
      isPublished: true,
    },
  });

  const catalog: Array<{
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    image: string;
    sku: string;
    price: string;
    stock: number;
    inBridal?: boolean;
  }> = [
    {
      name: "Champagne Halo Ring",
      slug: "champagne-halo-ring",
      description: "A delicate halo ring with warm champagne tones — perfect for everyday elegance.",
      categoryId: rings.id,
      image: IMG.rings,
      sku: "CHR-S7",
      price: "18500.00",
      stock: 5,
      inBridal: true,
    },
    {
      name: "Ivory Pendant Necklace",
      slug: "ivory-pendant-necklace",
      description: "Ivory-toned pendant on a fine chain.",
      categoryId: necklaces.id,
      image: IMG.pendant,
      sku: "IPN-STD",
      price: "12400.00",
      stock: 8,
    },
    {
      name: "Rose Gold Hoops",
      slug: "rose-gold-hoops",
      description: "Lightweight rose gold hoops with a soft shine.",
      categoryId: earrings.id,
      image: IMG.earrings,
      sku: "RGH-STD",
      price: "7800.00",
      stock: 12,
    },
    {
      name: "Pearl Drop Earrings",
      slug: "pearl-drop-earrings",
      description: "Classic pearl drops for evening wear.",
      categoryId: earrings.id,
      image: IMG.pearls,
      sku: "PDE-STD",
      price: "5400.00",
      stock: 0,
    },
    {
      name: "Emerald Cut Solitaire",
      slug: "emerald-cut-solitaire",
      description: "Clean emerald-cut solitaire in a slim band.",
      categoryId: rings.id,
      image: IMG.gemRing,
      sku: "ECS-S7",
      price: "42000.00",
      stock: 2,
      inBridal: true,
    },
    {
      name: "Layered Gold Chain",
      slug: "layered-gold-chain",
      description: "Fine layered chain necklace with a warm finish.",
      categoryId: necklaces.id,
      image: IMG.chain,
      sku: "LGC-STD",
      price: "9900.00",
      stock: 6,
    },
    {
      name: "Satin Bangle Set",
      slug: "satin-bangle-set",
      description: "A pair of satin-finish bangles.",
      categoryId: bracelets.id,
      image: IMG.bangles,
      sku: "SBS-STD",
      price: "11200.00",
      stock: 4,
    },
    {
      name: "Twisted Rope Bracelet",
      slug: "twisted-rope-bracelet",
      description: "Twisted rope bracelet with a secure clasp.",
      categoryId: bracelets.id,
      image: IMG.bracelet,
      sku: "TRB-STD",
      price: "8600.00",
      stock: 7,
    },
  ];

  for (const item of catalog) {
    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.create({
        data: {
          productId: existing.id,
          url: item.image,
          alt: item.name,
          sortOrder: 0,
        },
      });
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          description: item.description,
          isPublished: true,
          categoryId: item.categoryId,
        },
      });
    } else {
      const created = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          isPublished: true,
          categoryId: item.categoryId,
          images: {
            create: [{ url: item.image, alt: item.name, sortOrder: 0 }],
          },
          variants: {
            create: [
              {
                sku: item.sku,
                label: item.sku.includes("S7") ? "Size 7" : "Standard",
                price: item.price,
                stock: item.stock,
              },
            ],
          },
        },
      });
      if (item.inBridal) {
        await prisma.productCollection.upsert({
          where: {
            productId_collectionId: {
              productId: created.id,
              collectionId: bridal.id,
            },
          },
          update: {},
          create: {
            productId: created.id,
            collectionId: bridal.id,
          },
        });
      }
    }
  }

  const banners = await prisma.banner.findMany();
  if (banners.length === 0) {
    await prisma.banner.create({
      data: {
        title: "Classic jewellery collection",
        subtitle: "Every piece tells a story",
        imageUrl: IMG.rings,
        linkUrl: "/shop",
        sortOrder: 0,
        isActive: true,
      },
    });
  } else {
    await prisma.banner.update({
      where: { id: banners[0].id },
      data: {
        title: "Classic jewellery collection",
        subtitle: "Every piece tells a story",
        imageUrl: IMG.rings,
        isActive: true,
      },
    });
  }

  console.log("Seed complete. Admin:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
