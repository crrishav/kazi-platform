-- Pricing tiers seed data

-- T-shirts
insert into public.pricing_tiers (product_type, min_qty, max_qty, price_per_unit) values
  ('tshirt', 50, 99, 8.50),
  ('tshirt', 100, 249, 6.50),
  ('tshirt', 250, 499, 5.00),
  ('tshirt', 500, 999, 4.00),
  ('tshirt', 1000, null, 3.20);

-- Hoodies
insert into public.pricing_tiers (product_type, min_qty, max_qty, price_per_unit) values
  ('hoodie', 50, 99, 18.00),
  ('hoodie', 100, 249, 14.50),
  ('hoodie', 250, 499, 12.00),
  ('hoodie', 500, 999, 10.00),
  ('hoodie', 1000, null, 8.50);

-- Embroidery add-ons
insert into public.pricing_tiers (product_type, min_qty, max_qty, price_per_unit) values
  ('embroidery_small', 1, null, 2.50),
  ('embroidery_large', 1, null, 4.00);

-- Screen print
insert into public.pricing_tiers (product_type, min_qty, max_qty, price_per_unit) values
  ('screen_print_per_colour', 1, null, 1.50);

-- DTG print
insert into public.pricing_tiers (product_type, min_qty, max_qty, price_per_unit) values
  ('dtg_print', 1, null, 3.50);
