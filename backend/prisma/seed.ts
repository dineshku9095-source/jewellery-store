import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

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
    update: {},
    create: {
      id: 1,
      storeName: "Refine Gilt Jewellery",
      tagline: "Handcrafted pieces in champagne gold tones",
      contactEmail: "hello@refinegilt.example",
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

  const product = await prisma.product.upsert({
    where: { slug: "champagne-halo-ring" },
    update: {},
    create: {
      name: "Champagne Halo Ring",
      slug: "champagne-halo-ring",
      description:
        "A delicate halo ring with warm champagne tones — perfect for everyday elegance.",
      isPublished: true,
      categoryId: rings.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1605100804763-247f67af1677?w=800",
            alt: "Champagne halo ring",
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "CHR-S7",
            label: "Size 7",
            price: "18500.00",
            stock: 5,
          },
          {
            sku: "CHR-S8",
            label: "Size 8",
            price: "18500.00",
            stock: 3,
          },
        ],
      },
    },
    include: { variants: true },
  });

  await prisma.productCollection.upsert({
    where: {
      productId_collectionId: {
        productId: product.id,
        collectionId: bridal.id,
      },
    },
    update: {},
    create: {
      productId: product.id,
      collectionId: bridal.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "ivory-pendant-necklace" },
    update: {},
    create: {
      name: "Ivory Pendant Necklace",
      slug: "ivory-pendant-necklace",
      description: "Ivory-toned pendant on a fine chain.",
      isPublished: true,
      categoryId: necklaces.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4af8?w=800",
            alt: "Ivory pendant necklace",
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "IPN-STD",
            label: "Standard",
            price: "12400.00",
            stock: 8,
          },
        ],
      },
    },
  });

  await prisma.banner.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "New season arrivals",
        subtitle: "Discover champagne gold essentials",
        imageUrl:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200",
        linkUrl: "/shop",
        sortOrder: 0,
        isActive: true,
      },
    ],
  });

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
