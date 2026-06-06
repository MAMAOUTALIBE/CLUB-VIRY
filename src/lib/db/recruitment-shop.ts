import "server-only";

import type {
  AdminOrderStatusPayload,
  AdminPaymentUpdatePayload,
  AdminProductCategoryPayload,
  AdminProductPayload,
  AdminProductVariantPayload,
  AdminRecruitmentReviewPayload
} from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { queueAdminNotification, queueNotification } from "@/lib/db/notifications";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Order, OrderItem, Payment, Product, ProductCategory, ProductVariant, RecruitmentApplication } from "@/lib/db/types";

export type CreateRecruitmentApplicationInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone?: string | null;
  currentClub?: string | null;
  position?: string | null;
  categoryId?: string | null;
  message?: string | null;
};

export type PublicProductsPayload = {
  categories: ProductCategory[];
  products: Product[];
  variants: ProductVariant[];
};

export type CreateOrderInput = {
  profileId?: string | null;
  email: string;
  customerName: string;
  phone?: string | null;
  notes?: string | null;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
};

export type CreateCheckoutInput = {
  orderId?: string | null;
  registrationId?: string | null;
  amountCents?: number | null;
  provider: "manual" | "stripe";
};

export type OrderBundle = {
  order: Order;
  items: OrderItem[];
  payments: Payment[];
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function productCategoryPayloadToRow(input: AdminProductCategoryPayload) {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.slug || input.name ? { slug: input.slug ?? slugify(input.name as string) } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

function productPayloadToRow(input: AdminProductPayload) {
  return {
    ...(input.categoryId !== undefined ? { category_id: input.categoryId ?? null } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.slug || input.name ? { slug: input.slug ?? slugify(input.name as string) } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.imageUrl !== undefined ? { image_url: input.imageUrl ?? null } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.priceCents !== undefined ? { price_cents: input.priceCents } : {}),
    ...(input.currency ? { currency: input.currency } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {})
  };
}

function productVariantPayloadToRow(productId: string | null, input: AdminProductVariantPayload) {
  return {
    ...(productId ? { product_id: productId } : {}),
    ...(input.label ? { label: input.label } : {}),
    ...(input.sku !== undefined ? { sku: input.sku ?? null } : {}),
    ...(input.stockQuantity !== undefined ? { stock_quantity: input.stockQuantity } : {}),
    ...(input.priceDeltaCents !== undefined ? { price_delta_cents: input.priceDeltaCents } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

export async function createRecruitmentApplication(input: CreateRecruitmentApplicationInput): Promise<RecruitmentApplication> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("recruitment_applications")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      birth_date: input.birthDate,
      email: input.email,
      phone: input.phone ?? null,
      current_club: input.currentClub ?? null,
      position: input.position ?? null,
      category_id: input.categoryId ?? null,
      message: input.message ?? null,
      status: "PENDING"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create recruitment application: ${error.message}`);
  }

  await queueAdminNotification(
    {
      template: "recruitment_application_received",
      subject: `Nouvelle candidature détection : ${input.firstName} ${input.lastName}`,
      payload: {
        recruitmentApplicationId: data.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        position: input.position ?? null
      }
    },
    supabase
  );

  await recordActivity({
    action: "recruitment.application_created",
    entityType: "recruitment_application",
    entityId: data.id,
    metadata: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      position: input.position ?? null,
      currentClub: input.currentClub ?? null
    }
  });

  return data as RecruitmentApplication;
}

export async function listRecruitmentApplicationsForAdmin(limit = 100): Promise<RecruitmentApplication[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("recruitment_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch recruitment applications: ${error.message}`);
  }

  return (data ?? []) as RecruitmentApplication[];
}

export async function reviewRecruitmentApplication(
  id: string,
  input: AdminRecruitmentReviewPayload
): Promise<RecruitmentApplication> {
  const { data, error } = await getSupabaseAdminClient()
    .from("recruitment_applications")
    .update({ status: input.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to review recruitment application: ${error.message}`);
  }

  return data as RecruitmentApplication;
}

export async function listPublicProducts(): Promise<PublicProductsPayload> {
  const supabase = getSupabaseAdminClient();
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] = await Promise.all([
    supabase.from("product_categories").select("*").eq("is_active", true).order("order_index", { ascending: true }),
    supabase.from("products").select("*").eq("status", "ACTIVE").order("order_index", { ascending: true })
  ]);

  if (categoriesError) {
    throw new Error(`Unable to fetch product categories: ${categoriesError.message}`);
  }

  if (productsError) {
    throw new Error(`Unable to fetch products: ${productsError.message}`);
  }

  const productIds = (products ?? []).map((product) => product.id as string);

  if (productIds.length === 0) {
    return {
      categories: (categories ?? []) as ProductCategory[],
      products: [],
      variants: []
    };
  }

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (variantsError) {
    throw new Error(`Unable to fetch product variants: ${variantsError.message}`);
  }

  return {
    categories: (categories ?? []) as ProductCategory[],
    products: (products ?? []) as Product[],
    variants: (variants ?? []) as ProductVariant[]
  };
}

export async function listShopForAdmin(limit = 100): Promise<PublicProductsPayload> {
  const supabase = getSupabaseAdminClient();
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }, { data: variants, error: variantsError }] =
    await Promise.all([
      supabase.from("product_categories").select("*").order("order_index", { ascending: true }).limit(limit),
      supabase.from("products").select("*").order("order_index", { ascending: true }).limit(limit),
      supabase.from("product_variants").select("*").order("created_at", { ascending: false }).limit(limit)
    ]);

  if (categoriesError) {
    throw new Error(`Unable to fetch admin product categories: ${categoriesError.message}`);
  }

  if (productsError) {
    throw new Error(`Unable to fetch admin products: ${productsError.message}`);
  }

  if (variantsError) {
    throw new Error(`Unable to fetch admin product variants: ${variantsError.message}`);
  }

  return {
    categories: (categories ?? []) as ProductCategory[],
    products: (products ?? []) as Product[],
    variants: (variants ?? []) as ProductVariant[]
  };
}

export async function createProductCategory(input: AdminProductCategoryPayload): Promise<ProductCategory> {
  const { data, error } = await getSupabaseAdminClient()
    .from("product_categories")
    .insert({
      ...productCategoryPayloadToRow(input),
      is_active: input.isActive ?? true
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create product category: ${error.message}`);
  }

  return data as ProductCategory;
}

export async function updateProductCategory(id: string, input: AdminProductCategoryPayload): Promise<ProductCategory> {
  const { data, error } = await getSupabaseAdminClient()
    .from("product_categories")
    .update(productCategoryPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update product category: ${error.message}`);
  }

  return data as ProductCategory;
}

export async function createProduct(input: AdminProductPayload): Promise<Product> {
  const { data, error } = await getSupabaseAdminClient()
    .from("products")
    .insert({
      ...productPayloadToRow(input),
      status: input.status ?? "DRAFT",
      currency: input.currency ?? "EUR"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create product: ${error.message}`);
  }

  return data as Product;
}

export async function updateProduct(id: string, input: AdminProductPayload): Promise<Product> {
  const { data, error } = await getSupabaseAdminClient().from("products").update(productPayloadToRow(input)).eq("id", id).select("*").single();

  if (error) {
    throw new Error(`Unable to update product: ${error.message}`);
  }

  return data as Product;
}

export async function createProductVariant(productId: string, input: AdminProductVariantPayload): Promise<ProductVariant> {
  const { data, error } = await getSupabaseAdminClient()
    .from("product_variants")
    .insert({
      ...productVariantPayloadToRow(productId, input),
      stock_quantity: input.stockQuantity ?? 0,
      price_delta_cents: input.priceDeltaCents ?? 0,
      is_active: input.isActive ?? true
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create product variant: ${error.message}`);
  }

  return data as ProductVariant;
}

export async function updateProductVariant(id: string, input: AdminProductVariantPayload): Promise<ProductVariant> {
  const { data, error } = await getSupabaseAdminClient()
    .from("product_variants")
    .update(productVariantPayloadToRow(null, input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update product variant: ${error.message}`);
  }

  return data as ProductVariant;
}

export async function listOrdersForProfile(profileId: string): Promise<Order[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("orders")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch orders: ${error.message}`);
  }

  return (data ?? []) as Order[];
}

export async function listOrdersForAdmin(limit = 100): Promise<Order[]> {
  const { data, error } = await getSupabaseAdminClient().from("orders").select("*").order("created_at", { ascending: false }).limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin orders: ${error.message}`);
  }

  return (data ?? []) as Order[];
}

export async function getOrderBundleForProfile(profileId: string, orderId: string): Promise<OrderBundle | null> {
  return getOrderBundle(orderId, { profileId });
}

export async function getOrderBundleForAdmin(orderId: string): Promise<OrderBundle | null> {
  return getOrderBundle(orderId, { admin: true });
}

async function getOrderBundle(
  orderId: string,
  access: {
    profileId?: string;
    admin?: boolean;
  }
): Promise<OrderBundle | null> {
  const supabase = getSupabaseAdminClient();
  let orderQuery = supabase.from("orders").select("*").eq("id", orderId);

  if (!access.admin) {
    orderQuery = orderQuery.eq("profile_id", access.profileId ?? "");
  }

  const { data: order, error: orderError } = await orderQuery.maybeSingle();

  if (orderError) {
    throw new Error(`Unable to fetch order: ${orderError.message}`);
  }

  if (!order) {
    return null;
  }

  const [{ data: items, error: itemsError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", orderId).order("created_at", { ascending: true }),
    supabase.from("payments").select("*").eq("order_id", orderId).order("created_at", { ascending: false })
  ]);

  if (itemsError) {
    throw new Error(`Unable to fetch order items: ${itemsError.message}`);
  }

  if (paymentsError) {
    throw new Error(`Unable to fetch order payments: ${paymentsError.message}`);
  }

  return {
    order: order as Order,
    items: (items ?? []) as OrderItem[],
    payments: (payments ?? []) as Payment[]
  };
}

export async function updateOrderStatus(id: string, input: AdminOrderStatusPayload): Promise<Order> {
  const { data, error } = await getSupabaseAdminClient().from("orders").update({ status: input.status }).eq("id", id).select("*").single();

  if (error) {
    throw new Error(`Unable to update order status: ${error.message}`);
  }

  await queueNotification({
    recipientProfileId: data.profile_id ?? null,
    recipientEmail: data.email,
    template: "shop_order_status_updated",
    subject: "Mise à jour de votre commande ES Viry-Châtillon",
    payload: {
      orderId: data.id,
      status: data.status,
      totalCents: data.total_cents
    }
  });

  return data as Order;
}

export async function listPaymentsForAdmin(limit = 100): Promise<Payment[]> {
  const { data, error } = await getSupabaseAdminClient().from("payments").select("*").order("created_at", { ascending: false }).limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin payments: ${error.message}`);
  }

  return (data ?? []) as Payment[];
}

export async function getPaymentForAdmin(id: string): Promise<Payment | null> {
  const { data, error } = await getSupabaseAdminClient().from("payments").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch admin payment: ${error.message}`);
  }

  return data as Payment | null;
}

function orderStatusFromPaymentStatus(status: Payment["status"]): Order["status"] | null {
  if (status === "SUCCEEDED") {
    return "PAID";
  }

  if (status === "REFUNDED") {
    return "REFUNDED";
  }

  if (status === "CANCELLED") {
    return "CANCELLED";
  }

  return null;
}

export async function updatePaymentForAdmin(id: string, input: AdminPaymentUpdatePayload): Promise<Payment> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.providerReference !== undefined ? { provider_reference: input.providerReference } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {})
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update admin payment: ${error.message}`);
  }

  const payment = data as Payment;

  if (input.status) {
    const nextOrderStatus = orderStatusFromPaymentStatus(payment.status);

    if (payment.order_id && nextOrderStatus) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({ status: nextOrderStatus })
        .eq("id", payment.order_id)
        .select("*")
        .single();

      if (orderError) {
        throw new Error(`Unable to synchronize order payment status: ${orderError.message}`);
      }

      await queueNotification(
        {
          recipientProfileId: order.profile_id ?? null,
          recipientEmail: order.email,
          template: "payment_status_updated",
          subject: "Paiement ES Viry-Châtillon confirmé",
          payload: {
            paymentId: payment.id,
            orderId: order.id,
            paymentStatus: payment.status,
            orderStatus: order.status,
            amountCents: payment.amount_cents
          }
        },
        supabase
      );

      await recordActivity({
        action: "shop.order.payment_status_synced",
        entityType: "orders",
        entityId: order.id,
        metadata: {
          paymentId: payment.id,
          paymentStatus: payment.status,
          orderStatus: order.status
        }
      });
    }

    if (payment.registration_id && payment.status === "SUCCEEDED") {
      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", payment.registration_id)
        .maybeSingle();

      if (registrationError) {
        throw new Error(`Unable to fetch paid registration: ${registrationError.message}`);
      }

      if (registration?.submitted_by) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", registration.submitted_by)
          .maybeSingle();

        if (profileError) {
          throw new Error(`Unable to fetch registration payment recipient: ${profileError.message}`);
        }

        await queueNotification(
          {
            recipientProfileId: registration.submitted_by,
            recipientEmail: typeof profile?.email === "string" ? profile.email : null,
            template: "registration_payment_received",
            subject: "Paiement d'inscription reçu",
            payload: {
              paymentId: payment.id,
              registrationId: registration.id,
              amountCents: payment.amount_cents
            }
          },
          supabase
        );
      }
    }
  }

  return payment;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderBundle> {
  const supabase = getSupabaseAdminClient();
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const variantIds = [...new Set(input.items.map((item) => item.variantId).filter((variantId): variantId is string => Boolean(variantId)))];

  const [{ data: products, error: productsError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from("products").select("*").in("id", productIds).eq("status", "ACTIVE"),
    variantIds.length > 0
      ? supabase.from("product_variants").select("*").in("id", variantIds).eq("is_active", true)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (productsError) {
    throw new Error(`Unable to fetch products: ${productsError.message}`);
  }

  if (variantsError) {
    throw new Error(`Unable to fetch product variants: ${variantsError.message}`);
  }

  const productsById = new Map((products ?? []).map((product) => [product.id as string, product as Product]));
  const variantsById = new Map((variants ?? []).map((variant) => [variant.id as string, variant as ProductVariant]));

  const orderItems = input.items.map((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      throw new Error(`Product ${item.productId} is not available.`);
    }

    const variant = item.variantId ? variantsById.get(item.variantId) : null;

    if (item.variantId && !variant) {
      throw new Error(`Variant ${item.variantId} is not available.`);
    }

    const unitPrice = product.price_cents + (variant?.price_delta_cents ?? 0);

    return {
      product_id: product.id,
      variant_id: variant?.id ?? null,
      label: variant ? `${product.name} - ${variant.label}` : product.name,
      quantity: item.quantity,
      unit_price_cents: unitPrice,
      total_cents: unitPrice * item.quantity
    };
  });

  const totalCents = orderItems.reduce((total, item) => total + item.total_cents, 0);
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: input.profileId ?? null,
      email: input.email,
      customer_name: input.customerName,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      total_cents: totalCents,
      currency: "EUR",
      status: "PENDING"
    })
    .select("*")
    .single();

  if (orderError) {
    throw new Error(`Unable to create order: ${orderError.message}`);
  }

  const { data: createdItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      orderItems.map((item) => ({
        ...item,
        order_id: order.id
      }))
    )
    .select("*");

  if (itemsError) {
    throw new Error(`Unable to create order items: ${itemsError.message}`);
  }

  await Promise.all([
    queueAdminNotification(
      {
        template: "shop_order_received",
        subject: `Nouvelle commande boutique : ${input.customerName}`,
        payload: {
          orderId: order.id,
          customerName: input.customerName,
          email: input.email,
          totalCents,
          itemCount: orderItems.reduce((total, item) => total + item.quantity, 0)
        }
      },
      supabase
    ),
    queueNotification(
      {
        recipientEmail: input.email,
        template: "shop_order_confirmation",
        subject: "Votre commande ES Viry-Châtillon",
        payload: {
          orderId: order.id,
          customerName: input.customerName,
          totalCents,
          currency: "EUR"
        }
      },
      supabase
    )
  ]);

  await recordActivity({
    action: "shop.order_created",
    entityType: "order",
    entityId: order.id,
    metadata: {
      customerName: input.customerName,
      email: input.email,
      totalCents,
      itemCount: orderItems.reduce((total, item) => total + item.quantity, 0)
    }
  });

  return {
    order: order as Order,
    items: (createdItems ?? []) as OrderItem[],
    payments: []
  };
}

export async function createCheckout(input: CreateCheckoutInput): Promise<Payment> {
  const supabase = getSupabaseAdminClient();
  let amountCents = input.amountCents ?? null;

  if (!amountCents && input.orderId) {
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", input.orderId).maybeSingle();

    if (orderError) {
      throw new Error(`Unable to fetch order: ${orderError.message}`);
    }

    if (!order) {
      throw new Error("Order not found.");
    }

    amountCents = order.total_cents as number;
  }

  if (!amountCents || amountCents < 0) {
    throw new Error("Payment amount is missing.");
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: input.orderId ?? null,
      registration_id: input.registrationId ?? null,
      provider: input.provider,
      status: "PENDING",
      amount_cents: amountCents,
      currency: "EUR",
      metadata: {
        checkoutMode: input.provider === "stripe" ? "pending_provider_integration" : "manual"
      }
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create payment: ${error.message}`);
  }

  await Promise.all([
    queueAdminNotification(
      {
        template: "payment_checkout_created",
        subject: "Nouvelle intention de paiement",
        payload: {
          paymentId: data.id,
          orderId: input.orderId ?? null,
          registrationId: input.registrationId ?? null,
          provider: input.provider,
          amountCents
        }
      },
      supabase
    ),
    recordActivity({
      action: "payment.checkout_created",
      entityType: "payments",
      entityId: data.id,
      metadata: {
        orderId: input.orderId ?? null,
        registrationId: input.registrationId ?? null,
        provider: input.provider,
        amountCents
      }
    })
  ]);

  return data as Payment;
}
