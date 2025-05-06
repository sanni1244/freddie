# Overview
This project involves building a production-grade frontend module using Next.js 13 with TypeScript, integrated with the Freddie API. 

Tech Stack
Framework: Next.js 13 (App Router)
Language: TypeScript
Styling: TailwindCSS

API Integration: REST via OpenAPI (Swagger)
Deployment: Vercel (https://freddie-ten.vercel.app/)
<a href="https://freddie-ten.vercel.app/" alt="production link"/>

Freddie API base URL: https://api-freddie.ai-wk.com

API Docs: Freddie Swagger Docs

Core Functionalities Implemented
The application integrates the following endpoints:

Managers; Get all managers
Display grouped duplicates by name
Edit managers
Create Managers
Delete Managers
Show join date in a relative format (e.g., joined 3 days ago)

Identities
CRUD operations on manager identities
Filter by manager

Jobs
List jobs
Job details view, create, edit and delete
Job-related actions and responses

Form Templates
Create, edit, and manage form templates

Fields grouped logically by section

Form Actions
List and handle actions tied to form templates

Form Responses
Fetch and display form responses per job or form

Public Form Links
Generate and manage public links for forms

# State Management
Used local state and async functions with loading, error, and success handling

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

UI/UX
Responsive layout for mobile, tablet, and desktop

Reusable UI components

Clear feedback for actions (loading spinners, error messages, success indicators)

Setup Instructions
Prerequisites
Node.js >= 18

Yarn or npm

Git

Environment Variables
Create a .env.local file in the root with:

env
Copy
Edit
NEXT_PUBLIC_API_BASE_URL=https://api-freddie.ai-wk.com
Install & Run
bash
Copy
Edit
git clone https://github.com/sanni1244/freddie-ui.git  
cd freddie-ui  
npm install  
npm run dev
Deployment
A live version is available here: [Vercel](https://freddie-ten.vercel.app/)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
