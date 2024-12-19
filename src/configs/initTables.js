const pool = require("../services/db");

const SQLSTATEMENT = ` 
    DROP TABLE IF EXISTS User;

    CREATE TABLE IF NOT EXISTS User (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        amount_donated DECIMAL(65,2) DEFAULT 0.00,
        refresh_token VARCHAR(512)
    );

    -- insert sample data
    INSERT INTO User (username, email, password, amount_donated) VALUES
    ('moon', 'moon@gmail.com', '$2a$10$E2cr7bynsJrd/Uk6eJa0pOevdTa04nHoqUFex01UIYyQegxosXUwa', 100000.50),
    ('socks', 'socks@gmail.com', '$2a$10$rGzzzR29B5f/WnUjXekN0eRmuGo0UwOSIJSe0/D.f.GIDtaNex6BS', 101.10),
    ('user3', 'user3@gmail.com', '$2a$10$sX0dHMEHL3WjRpc5rQxDnedgXpFxP7IkR/tJ4Do/HKb82r.BVNgIu', 50);

    -- set default schema
    USE generositree;
`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating stored procedure:", error);
  } else {
    console.log("Stored procedure created successfully:", results);
  }
  process.exit();
});
