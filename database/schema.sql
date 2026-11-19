-- =====================================================================
-- ONG Lágrimas Blancas - Esquema PostgreSQL para Supabase
-- Pegar completo en: Supabase > SQL Editor > New query > Run
-- =====================================================================

-- pgcrypto: se usa SOLO en este seed para generar hashes bcrypt ($2a$10$...) compatibles con bcryptjs.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DROP TABLE IF EXISTS campaigns, announcements, volunteers, users, "session" CASCADE;

-- ---------- Trigger genérico para updated_at ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- 1) users ----------
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(100) NOT NULL,                      -- hash bcrypt (60 chars)
  role       VARCHAR(20)  NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------- 2) campaigns ----------
CREATE TABLE campaigns (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(150)  NOT NULL,
  description    TEXT          NOT NULL,
  goal_amount    DECIMAL(10,2) NOT NULL CHECK (goal_amount > 0),
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  image_url      VARCHAR(500),
  status         VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ---------- 3) announcements ----------
CREATE TABLE announcements (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  content      TEXT         NOT NULL,
  category     VARCHAR(20)  NOT NULL CHECK (category IN ('Noticia', 'Evento', 'Urgente')),
  published_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_announcements_category ON announcements(category);

-- ---------- 4) volunteers ----------
CREATE TABLE volunteers (
  id           SERIAL PRIMARY KEY,
  full_name    VARCHAR(120) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  availability VARCHAR(200) NOT NULL,
  skills       TEXT         NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'contacted')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_volunteers_status ON volunteers(status);

-- Triggers updated_at
CREATE TRIGGER trg_users_upd         BEFORE UPDATE ON users         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_campaigns_upd     BEFORE UPDATE ON campaigns     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_announcements_upd BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_volunteers_upd    BEFORE UPDATE ON volunteers    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- Tabla de sesiones (connect-pg-simple) ----------
CREATE TABLE "session" (
  "sid"    VARCHAR      NOT NULL COLLATE "default",
  "sess"   JSON         NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- ---------- SEGURIDAD: Row Level Security ----------
-- Activa RLS sin políticas: bloquea el acceso vía API REST pública de Supabase (anon key).
-- La app se conecta con el rol `postgres` (DATABASE_URL), que no se ve afectado.
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session"     ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SEED (datos iniciales de prueba)
-- Contraseña inicial de ambos usuarios:  Cambiar#2026   (¡cámbiala en producción!)
-- =====================================================================
INSERT INTO users (name, email, password, role) VALUES
  ('Administrador General', 'admin@lagrimasblancas.org',      extensions.crypt('Cambiar#2026', extensions.gen_salt('bf', 10)), 'superadmin'),
  ('Coordinadora de Comunicaciones', 'comunicaciones@lagrimasblancas.org', extensions.crypt('Cambiar#2026', extensions.gen_salt('bf', 10)), 'admin');

INSERT INTO campaigns (title, description, goal_amount, current_amount, image_url, status, user_id) VALUES
  ('Abrigo para el invierno andino',
   'Recolectamos frazadas, camperas y gorros para familias de las zonas altas de Arequipa que enfrentan heladas durante los meses de invierno.',
   8000.00, 5200.00, 'https://placehold.co/800x450/008B8B/FFFFFF?text=Abrigo+para+el+invierno', 'active', 1),
  ('Útiles escolares para 150 niños',
   'Mochilas, cuadernos y útiles para estudiantes de primaria de comunidades periféricas, para que inicien el año escolar en igualdad de condiciones.',
   6000.00, 1800.00, 'https://placehold.co/800x450/C71585/FFFFFF?text=Utiles+escolares', 'active', 1),
  ('Canasta alimentaria mensual',
   'Entrega de canastas básicas a adultos mayores en situación de vulnerabilidad.',
   4500.00, 1200.00, 'https://placehold.co/800x450/008B8B/FFFFFF?text=Canasta+alimentaria', 'active', 2),
  ('Botiquín comunitario 2025',
   'Campaña finalizada: se equiparon 3 botiquines comunitarios y se capacitó a 40 vecinos en primeros auxilios. ¡Gracias a todos los donantes!',
   3000.00, 3000.00, 'https://placehold.co/800x450/6c757d/FFFFFF?text=Botiquin+comunitario', 'completed', 1);

INSERT INTO announcements (title, content, category, user_id) VALUES
  ('Jornada solidaria de entrega de abrigo',
   'Este sábado entregaremos abrigo a 60 familias. Si deseas colaborar con el traslado o el reparto, escríbenos desde la sección de voluntariado.',
   'Evento', 2),
  ('Convocatoria urgente de donación de frazadas',
   'Por el descenso de temperatura necesitamos frazadas con urgencia. Puedes entregarlas en nuestra sede o donar mediante los canales oficiales.',
   'Urgente', 1),
  ('Balance de la campaña Botiquín comunitario',
   'Cerramos la campaña con la meta cumplida. Publicamos el resumen de ingresos y gastos para garantizar total transparencia.',
   'Noticia', 1),
  ('Taller de primeros auxilios para voluntarios',
   'Invitamos a nuestros voluntarios aprobados a un taller práctico de primeros auxilios básicos.',
   'Evento', 2);

INSERT INTO volunteers (full_name, email, phone, availability, skills, status) VALUES
  ('María Quispe Huamán', 'maria.quispe@example.com', '+51 954 000 111', 'Sábados por la mañana', 'Trabajo social, atención al público', 'pending'),
  ('Luis Fernández Cáceres', 'luis.fernandez@example.com', '+51 954 000 222', 'Lunes a viernes por la tarde', 'Diseño gráfico, redes sociales', 'contacted');
