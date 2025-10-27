-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    problem TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_timestamp ON problems(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_problems_email ON problems(email);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problems_updated_at 
    BEFORE UPDATE ON problems 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
