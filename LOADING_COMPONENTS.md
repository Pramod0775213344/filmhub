# Loading Components Usage Guide

## Overview

FilmHub now has beautiful, branded loading indicators for various use cases.

---

## 1. Page Loading (Automatic)

### Default Next.js Loading

The `src/app/loading.js` file handles automatic loading states for page transitions.

**Features:**

- Full-screen loading overlay
- Animated FilmHub logo with spinning ring
- Bouncing dots animation
- Gradient background effects
- Auto-shows during route changes

**No code needed** - Next.js uses this automatically!

---

## 2. Top Progress Bar

The top red progress bar (NextTopLoader) shows during navigation.

**Features:**

- Red glowing progress bar at top
- Small spinning indicator (enabled)
- Smooth animations
- Automatically shows on page transitions

---

## 3. Custom Loading Component

Import and use the `LoadingSpinner` component anywhere in your app.

### Full Screen Loading

```jsx
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading movies..." />;
  }

  return <div>Your content</div>;
}
```

### Inline Loading (in a section)

```jsx
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MyComponent() {
  return (
    <div className="container">
      <LoadingSpinner size="default" message="Fetching data..." />
    </div>
  );
}
```

### Different Sizes

```jsx
// Small spinner
<LoadingSpinner size="small" message="Please wait..." />

// Default spinner
<LoadingSpinner size="default" message="Loading..." />

// Large spinner
<LoadingSpinner size="large" message="Loading content..." />
```

### Without Message

```jsx
<LoadingSpinner size="default" message={false} />
```

---

## 4. Inline Spinner (for buttons/forms)

For small loading indicators inside buttons or forms:

```jsx
import { InlineSpinner } from "@/components/LoadingSpinner";

export default function SubmitButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button disabled={loading}>
      {loading ? (
        <>
          <InlineSpinner size={16} className="mr-2" />
          Processing...
        </>
      ) : (
        "Submit"
      )}
    </button>
  );
}
```

---

## 5. Skeleton Loader

For content placeholders while data loads:

```jsx
import { SkeletonLoader } from "@/components/LoadingSpinner";

export default function MovieList() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SkeletonLoader count={5} className="p-4" />;
  }

  return <div>Your movie list</div>;
}
```

---

## Examples in Context

### Example 1: Data Fetching Page

```jsx
"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      const data = await fetch("/api/movies");
      const movies = await data.json();
      setMovies(movies);
      setLoading(false);
    }
    fetchMovies();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading movies..." />;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
```

### Example 2: Form Submission

```jsx
"use client";

import { useState } from "react";
import { InlineSpinner } from "@/components/LoadingSpinner";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" />
      <button type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <InlineSpinner size={16} className="mr-2" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
```

### Example 3: Lazy Loading Section

```jsx
import { SkeletonLoader } from "@/components/LoadingSpinner";
import { Suspense } from "react";

async function MovieRecommendations() {
  const movies = await fetchRecommendations();
  return <MovieGrid movies={movies} />;
}

export default function HomePage() {
  return (
    <div>
      <h1>Recommended for You</h1>
      <Suspense fallback={<SkeletonLoader count={4} />}>
        <MovieRecommendations />
      </Suspense>
    </div>
  );
}
```

---

## Visual Features

All loading components feature:

- ✨ FilmHub branding (logo + colors)
- 🎨 Red (#E50914) accent color
- ⚡ Smooth animations
- 🌙 Dark theme design
- 💎 Glassmorphism effects
- 📱 Mobile responsive

---

## Best Practices

1. **Page transitions**: Use automatic `loading.js` (already set up)
2. **Full page loads**: Use `<LoadingSpinner fullScreen />`
3. **Section loads**: Use `<LoadingSpinner />` without fullScreen
4. **Button states**: Use `<InlineSpinner />`
5. **Content placeholders**: Use `<SkeletonLoader />`

---

## Animation Details

- **Spinning ring**: 360° rotation, 1s duration
- **Pulsing logo**: Scale animation, 2s duration
- **Bouncing dots**: Vertical bounce with staggered delays (0ms, 150ms, 300ms)
- **Background gradients**: Slow pulse animations

The loading experience is now premium and on-brand! 🎬✨
