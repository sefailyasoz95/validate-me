-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    birth_date DATE,
    gender TEXT,
    country TEXT,
    city TEXT
);

-- Questions Table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    next_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL
);

-- Answers Table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Responses Table
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Policies
-- Only authenticated users can create polls (questions)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_can_insert" 
ON questions FOR INSERT 
WITH CHECK (auth.uid() = user_id);
-- Everyone can see questions
CREATE POLICY "public_can_select" 
ON questions FOR SELECT 
USING (true);

-- Only authenticated users can create answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_can_insert" 
ON answers FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Everyone can see answers
CREATE POLICY "public_can_select" 
ON answers FOR SELECT 
USING (true);

-- Everyone can create a response
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "everyone_can_insert" 
ON responses FOR INSERT 
WITH CHECK (true);

-- Only question owners can see responses to their questions
CREATE POLICY "question_owners_can_see_responses" 
ON responses FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM questions WHERE questions.id = responses.question_id));

-- Create a trigger to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, avatar_url, display_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
