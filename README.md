# Product Admin Dashboard

A responsive product management dashboard built as a React Developer assignment using **Next.js, React, Tailwind CSS, Axios, and DummyJSON API**.

## Live Demo

https://product-addmin-dashboard.netlify.app/login

## GitHub Repository

https://github.com/RupaliPrabha/product-admin-dashboard

## Tech Stack

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Axios
* DummyJSON API
* Git & GitHub

## Features

### Authentication

* Login using the provided DummyJSON credentials
* Authentication token stored in browser storage
* Protected product routes
* Logout functionality
* Prevents multiple login requests from rapid clicks

### Product Dashboard

* Responsive product table for desktop
* Responsive product cards for mobile
* Product image, title, category, price, rating and stock
* Product details page
* Product reviews

### Pagination

* Page numbers
* Previous / Next buttons
* Page size options: 10, 20 and 50
* Displays the current item range and total count
* Pagination state is stored in the URL
* Invalid page values are handled safely

### Search

* Product search using DummyJSON search API
* 500ms debounce before making the request
* Search state stored in the URL
* Search resets pagination to page 1
* Previous search requests are cancelled using AbortController to prevent stale results

### Filter & Sort

* Category filtering
* Sort by:

  * Price
  * Rating
  * Title
* Sort and filter values are stored in the URL

### Product Management

* Add products
* Edit products
* Delete products
* Form validation
* Delete confirmation
* Changes are reflected immediately in the application

### UI States

* Loading state
* Empty state
* Error state
* Retry functionality
* Product not found handling

## API

This project uses the free DummyJSON API:

https://dummyjson.com

All API requests are handled through Axios.

A shared Axios instance is used for:

* Base API configuration
* Authentication token handling
* Centralized response error handling

## Demo Login

Use the credentials provided in the assignment:

```text
Username: emilys
Password: emilyspass
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RupaliPrabha/product-admin-dashboard.git
```

### 2. Navigate to the project

```bash
cd product-admin-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Production build

To create a production build:

```bash
npm run build
```

To run the production build:

```bash
npm start
```

## Project Structure

```text
product-admin-dashboard/
│
├── app/
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   └── ProductTable.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   └── products/
│       ├── [id]/
│       │   ├── edit/
│       │   │   └── page.tsx
│       │   └── page.tsx
│       │
│       ├── add/
│       │   └── page.tsx
│       │
│       └── page.tsx
│
├── lib/
│   ├── auth.ts
│   ├── authApi.ts
│   ├── axios.ts
│   └── productApi.ts
│
├── next.config.ts
├── package.json
└── README.md
```

## Implementation Choices

### Shared Axios Setup

A single Axios instance is used for API communication. Request and response interceptors handle authentication and common errors centrally.

### URL State

Page, page size, search, category and sort values are kept in the URL. This allows the current dashboard state to remain available after refreshing the page or sharing the URL.

### Search Race-Condition Handling

Search requests use a debounce and `AbortController`. When a newer search starts, the previous request can be cancelled so an older response does not replace the latest search results.

### Search and Category

DummyJSON does not provide a combined search-and-category endpoint. Therefore, the application treats search and category filtering as mutually exclusive. Selecting one clears the other.

### Add, Edit and Delete

DummyJSON simulates add, update and delete operations and does not permanently save those changes. The application therefore keeps local changes in browser session storage so that the changes remain visible during the current session.

## Problem Faced and Solution

### Problem

During testing, adding multiple products caused duplicate React key errors because DummyJSON could return the same product ID for simulated added products.

### Solution

The application assigns a unique local ID using `Date.now()` for newly added products. This prevents duplicate React keys and allows locally added products to be managed independently.

Another production-build issue occurred because `useSearchParams()` on the products page required a Suspense boundary in Next.js.

The page was wrapped with React `Suspense`, which resolved the production build error.

## AI Assistance

AI tools were used during development to help with:

* Understanding Next.js and React concepts
* Structuring API utility files
* Debugging errors
* Improving error handling
* Implementing debounce and request cancellation
* Reviewing code and explaining implementation details

All generated code was reviewed, tested and understood before being used in the project.

## Validation

The project was tested for:

* Login and logout
* Protected routes
* Product listing
* Responsive desktop/mobile layouts
* Pagination
* Search and debounce
* Search race-condition handling
* Category filtering
* Sorting
* Product details
* Invalid product IDs
* Add, edit and delete operations
* Form validation
* Loading, empty and error states
* Retry functionality
* Invalid URL parameters
* Rapid login/save clicks
* ESLint
* Production build

### Quality Checks

```bash
npm run lint
```

```bash
npm run build
```

Both checks pass successfully.

## Author

**Rupali Prabha Bunkar**

GitHub: https://github.com/RupaliPrabha
