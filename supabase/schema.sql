-- Create players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7) NOT NULL
);

-- Create tiles table
CREATE TABLE tiles (
    id SERIAL PRIMARY KEY,
    index INTEGER NOT NULL UNIQUE CHECK (index >= 0 AND index <= 24),
    task_name VARCHAR(255) NOT NULL,
    icon_id VARCHAR(255)
);

-- Create completions table (Many-to-Many)
CREATE TABLE completions (
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    tile_id INTEGER REFERENCES tiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (player_id, tile_id)
);

-- Enable Realtime for the completions table
-- Note: This might need to be done via the Supabase Dashboard as well, but this is the SQL equivalent
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE completions;
COMMIT;

-- Seed Data

-- Insert Players
INSERT INTO players (name, color_hex) VALUES
('IR33CE', '#ef4444'),        -- Red
('PlzDaddy No', '#3b82f6'),   -- Blue
('IMJx', '#10b981'),          -- Green
('Bulldodge', '#f59e0b'),     -- Yellow
('KingCass524', '#8b5cf6'),   -- Purple
('Fired Fate', '#ec4899');    -- Pink

-- Insert Tiles (25 placeholders)
INSERT INTO tiles (index, task_name, icon_id) VALUES
(0, 'Fire Cape', '6570'),
(1, 'Barrows Item', '4716'),
(2, 'Zulrah Unique', '12922'),
(3, 'God Wars Drop', '11832'),
(4, 'Any Pet', '13320'),
(5, 'Dragon Pickaxe', '11920'),
(6, 'ToA Purple', '27238'),
(7, 'CoX Purple', '21034'),
(8, 'ToB Purple', '22477'),
(9, 'Dragon Warhammer', '13576'),
(10, 'Corp Beast Drop', '12817'),
(11, 'Nex Drop', '26235'),
(12, 'Abyssal Whip', '4151'),
(13, 'Ranger Boots', '2577'),
(14, 'Imbued Heart', '20724'),
(15, 'Tome of Fire', '20714'),
(16, 'Gauntlet Unique', '23995'),
(17, 'Pharaoh''s Sceptre', '9044'),
(18, 'Black Mask', '8901'),
(19, 'Brimstone Ring', '22975'),
(20, 'Zenyte Shard', '19529'),
(21, 'Kalphite Queen Head', '9736'),
(22, 'Vorkath Head', '21907'),
(23, 'Skilling Outfit Piece', '10933'),
(24, 'Champion Scroll', '6806');
