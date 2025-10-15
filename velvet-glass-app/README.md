# Velvet Glass Design System

A beautiful glassmorphism-based design system built with Expo, featuring blur effects, transparency, and liquid glass aesthetics.

## Features

- **Glassmorphism Components**: Pre-built components with glass effects
- **Multiple Glass Styles**: From subtle to strong blur intensities
- **Gradient Backgrounds**: Beautiful animated gradient backgrounds
- **Cross-Platform**: Works on iOS, Android, and Web
- **TypeScript**: Full type safety and IntelliSense support
- **Themeable**: Comprehensive theming system
- **Native Glass Effects**: Uses native iOS liquid glass when available

## Installation

```bash
npm install
```

## Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Design System Structure

```
src/design-system/
├── theme/              # Theme configuration
│   ├── colors.ts       # Color palette with glass variants
│   ├── spacing.ts      # Spacing scale
│   ├── typography.ts   # Type scale and fonts
│   ├── glass.ts        # Glass effect configurations
│   └── index.ts        # Theme exports
├── primitives/         # Core components
│   ├── GlassView.tsx   # Base glass component
│   ├── GlassCard.tsx   # Card with glass effects
│   ├── GlassText.tsx   # Text component
│   ├── GlassButton.tsx # Button with glass effects
│   └── index.ts        # Component exports
└── utils/              # Utility components
    ├── GradientBackground.tsx
    └── index.ts
```

## Components

### GlassView

The core primitive for creating glassmorphism effects.

```tsx
import { GlassView } from './src/design-system';

<GlassView
  glassStyle="medium"
  borderRadius="lg"
  shadow="md"
>
  <Text>Content</Text>
</GlassView>
```

**Props:**
- `glassStyle`: 'subtle' | 'light' | 'medium' | 'strong' | 'darkSubtle' | 'darkMedium' | 'darkStrong'
- `intensity`: Custom blur intensity (1-100)
- `tint`: 'light' | 'dark' | 'default' | 'extraLight'
- `borderRadius`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
- `shadow`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `useNativeGlass`: Use native iOS glass effect when available (default: true)

### GlassCard

Card component with padding and margin utilities.

```tsx
import { GlassCard } from './src/design-system';

<GlassCard
  glassStyle="medium"
  padding={4}
  margin={4}
  borderRadius="xl"
>
  <Text>Card content</Text>
</GlassCard>
```

**Props:** Extends GlassView props plus:
- `padding`: Spacing key (0-96)
- `margin`: Spacing key (0-96)

### GlassText

Text component optimized for glassmorphism backgrounds.

```tsx
import { GlassText } from './src/design-system';

<GlassText
  variant="heading"
  size="2xl"
  weight="bold"
>
  Heading Text
</GlassText>
```

**Props:**
- `variant`: 'heading' | 'body' | 'caption'
- `size`: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
- `weight`: 'thin' | 'extraLight' | 'light' | 'normal' | 'medium' | 'semiBold' | 'bold' | 'extraBold' | 'black'
- `color`: Custom color string

### GlassButton

Pressable button with glass effects and animations.

```tsx
import { GlassButton } from './src/design-system';

<GlassButton
  title="Click Me"
  glassStyle="medium"
  onPress={() => console.log('Pressed')}
  fullWidth
/>
```

**Props:** Extends GlassView props plus:
- `onPress`: Press handler function
- `title`: Button text
- `disabled`: Disabled state
- `padding`: Spacing key (0-96)
- `fullWidth`: Full width button

### GradientBackground

Provides animated gradient backgrounds.

```tsx
import { GradientBackground } from './src/design-system';

<GradientBackground gradient="aurora">
  <YourContent />
</GradientBackground>
```

**Props:**
- `gradient`: 'aurora' | 'sunset' | 'ocean' | 'forest' | 'cosmic'

## Theme

Access the theme configuration:

```tsx
import { theme } from './src/design-system';

// Colors
theme.colors.glass.medium
theme.colors.primary[500]

// Spacing
theme.spacing[4] // 16px

// Typography
theme.typography.fontSize.xl
theme.typography.fontWeight.bold

// Glass effects
theme.glass.blur.medium
theme.glass.borderRadius.lg
```

## Glass Styles

The design system includes predefined glass styles:

- **subtle**: Minimal blur (10), high transparency
- **light**: Moderate blur (25), light transparency
- **medium**: Balanced blur (50), moderate transparency
- **strong**: Heavy blur (75), moderate transparency
- **darkSubtle**: Dark variant with minimal blur
- **darkMedium**: Dark variant with moderate blur
- **darkStrong**: Dark variant with heavy blur

## Customization

### Custom Glass Effects

```tsx
<GlassView
  intensity={80}
  tint="dark"
  borderRadius="2xl"
  shadow="xl"
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  }}
>
  <Text>Custom glass</Text>
</GlassView>
```

### Extending the Theme

Modify theme files in `src/design-system/theme/` to customize:
- Color palette
- Spacing scale
- Typography settings
- Glass effect presets

## Platform-Specific Features

### iOS Native Glass

On iOS 26+, the design system automatically uses native liquid glass effects via `expo-glass-effect` when available:

```tsx
<GlassView
  useNativeGlass={true} // Default
  glassStyle="medium"
>
  {/* Uses native iOS UIVisualEffectView */}
</GlassView>
```

### Cross-Platform Fallback

On other platforms or when native glass is unavailable, it falls back to `expo-blur` for consistent cross-platform rendering.

## Dependencies

- `expo` ~54.0.13
- `expo-blur` ~15.0.7
- `expo-glass-effect` ~0.1.4
- `expo-linear-gradient` ~15.0.7
- `react-native` 0.81.4
- `react` 19.1.0

## TypeScript Support

All components include full TypeScript type definitions:

```tsx
import type {
  GlassViewProps,
  GlassCardProps,
  GlassTextProps,
  GlassButtonProps,
  Theme,
  GlassStyle,
} from './src/design-system';
```

## Performance

- Lazy-loaded components
- Optimized blur rendering
- Minimal bundle impact
- Native performance on iOS

## Examples

See `App.tsx` for a comprehensive showcase of all components and features.

## License

MIT
