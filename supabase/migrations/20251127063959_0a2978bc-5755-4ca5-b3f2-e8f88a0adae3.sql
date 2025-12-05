-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'customer');
CREATE TYPE flight_status AS ENUM ('scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE seat_class AS ENUM ('economy', 'business', 'first');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'checkin_reminder', 'flight_delay', 'flight_cancellation', 'gate_change');

-- User Roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Saved Passengers table
CREATE TABLE saved_passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender gender NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own passengers"
  ON saved_passengers FOR ALL
  USING (auth.uid() = user_id);

-- Saved Cards table (masked)
CREATE TABLE saved_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_last_four TEXT NOT NULL,
  card_type TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  cardholder_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cards"
  ON saved_cards FOR ALL
  USING (auth.uid() = user_id);

-- Airports table
CREATE TABLE airports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  timezone TEXT NOT NULL,
  terminal_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view airports"
  ON airports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage airports"
  ON airports FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Aircrafts table
CREATE TABLE aircrafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  economy_seats INTEGER NOT NULL,
  business_seats INTEGER NOT NULL,
  first_class_seats INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE aircrafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aircrafts"
  ON aircrafts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage aircrafts"
  ON aircrafts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_airport_id UUID NOT NULL REFERENCES airports(id),
  destination_airport_id UUID NOT NULL REFERENCES airports(id),
  distance_km INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_airports CHECK (source_airport_id != destination_airport_id)
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view routes"
  ON routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage routes"
  ON routes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Flight Templates table
CREATE TABLE flight_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number TEXT UNIQUE NOT NULL,
  route_id UUID NOT NULL REFERENCES routes(id),
  airline_name TEXT NOT NULL DEFAULT 'Scalebrand Airlines',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flight_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flight templates"
  ON flight_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage flight templates"
  ON flight_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Flight Instances table
CREATE TABLE flight_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES flight_templates(id),
  aircraft_id UUID NOT NULL REFERENCES aircrafts(id),
  flight_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  status flight_status NOT NULL DEFAULT 'scheduled',
  gate TEXT,
  economy_price DECIMAL(10,2) NOT NULL,
  business_price DECIMAL(10,2) NOT NULL,
  first_class_price DECIMAL(10,2),
  available_economy_seats INTEGER NOT NULL,
  available_business_seats INTEGER NOT NULL,
  available_first_class_seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flight_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flight instances"
  ON flight_instances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage flight instances"
  ON flight_instances FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Seats table
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID NOT NULL REFERENCES aircrafts(id),
  seat_number TEXT NOT NULL,
  seat_class seat_class NOT NULL,
  row_number INTEGER NOT NULL,
  column_letter TEXT NOT NULL,
  is_window BOOLEAN DEFAULT false,
  is_aisle BOOLEAN DEFAULT false,
  UNIQUE(aircraft_id, seat_number)
);

ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seats"
  ON seats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage seats"
  ON seats FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pnr TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  flight_instance_id UUID NOT NULL REFERENCES flight_instances(id),
  booking_status booking_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  base_fare DECIMAL(10,2) NOT NULL,
  taxes DECIMAL(10,2) NOT NULL,
  addon_charges DECIMAL(10,2) DEFAULT 0,
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Booking Passengers table
CREATE TABLE booking_passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender gender NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  seat_id UUID REFERENCES seats(id),
  seat_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view passengers from their bookings"
  ON booking_passengers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add passengers to their bookings"
  ON booking_passengers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all booking passengers"
  ON booking_passengers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their bookings"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add-ons table
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view addons"
  ON addons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage addons"
  ON addons FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Booking Add-ons table
CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view addons from their bookings"
  ON booking_addons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_addons.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Check-ins table
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  passenger_id UUID NOT NULL REFERENCES booking_passengers(id),
  checkin_time TIMESTAMPTZ DEFAULT NOW(),
  boarding_pass_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checkins for their bookings"
  ON checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = checkins.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checkins for their bookings"
  ON checkins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = checkins.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_instances_updated_at BEFORE UPDATE ON flight_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  
  -- Assign default customer role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();