CREATE TABLE users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    openid TEXT UNIQUE NOT NULL,

    nickname TEXT,

    avatar_url TEXT,

    phone TEXT,

    order_count INTEGER DEFAULT 0,

    total_spent REAL DEFAULT 0,

    last_order_at DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE pickup_locations (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    address TEXT,

    is_active INTEGER DEFAULT 1

);



CREATE TABLE products (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    description TEXT,

    image_url TEXT,

    price REAL NOT NULL,

    stock INTEGER DEFAULT 999,

    is_active INTEGER DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    pickup_location_id INTEGER,

    customer_name TEXT,

    customer_phone TEXT,

    pickup_time TEXT,

    total_amount REAL NOT NULL,

    status TEXT DEFAULT 'pending',

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id),

    FOREIGN KEY(pickup_location_id) REFERENCES pickup_locations(id)

);



CREATE TABLE order_items (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price REAL NOT NULL,

    subtotal REAL NOT NULL,

    FOREIGN KEY(order_id) REFERENCES orders(id),

    FOREIGN KEY(product_id) REFERENCES products(id)

);



INSERT INTO pickup_locations (name,address)

VALUES

('Irvine','14282 Culver Dr, Irvine, CA 92604'),

('Los Angeles','525 S Santa Fe Ave, Los Angeles, CA 90013');
