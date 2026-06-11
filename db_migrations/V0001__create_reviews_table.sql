CREATE TABLE t_p66532775_bike_tour_exploratio.reviews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  tour TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);