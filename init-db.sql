-- Database initialization script for Inventory Management System

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created by Django migrations, but we can add additional ones here

-- Example: Full-text search index for products
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search
-- ON inventory_product USING gin (to_tsvector('english', name || ' ' || description));

-- Example: Index for order status and date combinations
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date
-- ON orders_order (status, created_at DESC);

-- Example: Index for inventory levels
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_levels
-- ON inventory_inventoryitem (product_id, warehouse_id, quantity);

-- Add any custom database functions or triggers here if needed

-- Example: Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Actual table creation and indexing is handled by Django migrations
-- This file is for any additional database setup required