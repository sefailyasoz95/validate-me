# Product Requirements Document (PRD)

## 1. Overview

### 1.1 Product Name

ValidateMe

### 1.2 Description

The ValidateMe is a web application that allows users to create and share polls to validate their business ideas. Users sign in via Google (Supabase authentication), create structured polls with predefined answers, and share them with others for feedback. The platform enables multiple polls to be linked in a sequence to guide respondents through a structured validation process.

### 1.3 Goals

- Allow users to validate business ideas through structured polls.
- Enable easy sign-in with Google via Supabase.
- Provide a seamless experience for creating, sharing, and responding to polls.
- Track and store responses for future analysis.

## 2. Features

### 2.1 User Authentication

- Users sign in via Google using Supabase Auth.
- User data is stored in the `users` table after authentication.

### 2.2 Poll Creation

- Users can create polls with predefined answers.
- Each poll contains a question and multiple predefined answers.
- Users can link multiple polls together, forming a sequence.
- Polls have timestamps for creation and updates.

### 2.3 Poll Answering

- Respondents can select predefined answers.
- Responses are stored in the database.
- Users can navigate through linked polls seamlessly.

### 2.4 Data Storage & Structure

#### 2.4.1 Tables

- **Users Table**: Stores user information.
- **Questions Table**: Stores questions and links to the next question if applicable.
- **Answers Table**: Stores predefined answer options.
- **Responses Table**: Stores user responses to questions.

## 3. Technical Specifications

### 3.1 Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Authentication, Functions)
- **Database:** PostgreSQL (hosted on Supabase)
- **UI:** Shadcn/UI - Mobile Responsive - Dark Mode - Light Mode

### 3.2 API Endpoints

- **POST `/questions`** – Create a new question.
- **GET `/questions/:id`** – Fetch a question and its answers.
- **POST `/responses`** – Submit an answer.
- **GET `/responses/:question_id`** – Fetch responses for a specific question.

## 4. User Flow

1. User signs in via Google.
2. User creates a poll by entering a question and predefined answers.
3. User optionally links the poll to another poll.
4. User shares the poll link with respondents.
5. Respondents select predefined answers and proceed through the sequence.
6. User can analyze collected responses.

## 5. Success Metrics

- Number of polls created.
- Number of responses collected.
- User engagement (e.g., returning users, poll completion rate).

## 6. Future Enhancements

- **Analytics Dashboard**: View response trends and insights.
- **Anonymous Polls**: Allow users to submit responses without authentication.
- **Sharing & Embedding**: Enable easy sharing on social media or embedding in websites.

---
