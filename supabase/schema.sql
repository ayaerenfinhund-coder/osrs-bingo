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

-- Insert Tiles (25 tasks) - icon_id uses OSRS Wiki image filenames
INSERT INTO tiles (index, task_name, icon_id) VALUES
(0,  'Fire Cape',             'Fire_cape.png'),
(1,  'Barrows Item',          'Dharok%27s_helm.png'),
(2,  'Zulrah Unique',         'Tanzanite_fang.png'),
(3,  'God Wars Drop',         'Bandos_chestplate.png'),
(4,  'Any Pet',               'Heron.png'),
(5,  'Dragon Pickaxe',        'Dragon_pickaxe.png'),
(6,  'ToA Purple',            'Tumeken%27s_shadow_%28uncharged%29.png'),
(7,  'CoX Purple',            'Twisted_bow.png'),
(8,  'ToB Purple',            'Scythe_of_vitur_%28uncharged%29.png'),
(9,  'Dragon Warhammer',      'Dragon_warhammer.png'),
(10, 'Corp Beast Drop',       'Elysian_sigil.png'),
(11, 'Nex Drop',              'Zaryte_crossbow.png'),
(12, 'Abyssal Whip',          'Abyssal_whip.png'),
(13, 'Ranger Boots',          'Ranger_boots.png'),
(14, 'Imbued Heart',          'Imbued_heart.png'),
(15, 'Tome of Fire',          'Tome_of_fire.png'),
(16, 'Gauntlet Unique',       'Crystal_armour_seed.png'),
(17, 'Pharaoh''s Sceptre',    'Pharaoh%27s_sceptre.png'),
(18, 'Black Mask',            'Black_mask.png'),
(19, 'Brimstone Ring',        'Brimstone_ring.png'),
(20, 'Zenyte Shard',          'Zenyte_shard.png'),
(21, 'Kalphite Queen Head',   'Kalphite_queen_head.png'),
(22, 'Vorkath Head',          'Vorkath%27s_head.png'),
(23, 'Skilling Pet',          'Rocky.png'),
(24, 'Champion Scroll',       'Champion%27s_scroll.png');
