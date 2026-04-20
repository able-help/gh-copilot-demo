# React Native Accessibility Guide

Accessibility in React Native is mostly about giving every control a clear role, name, state, and predictable interaction pattern.

## Practical rules

- Use semantic accessibility props on every interactive control: `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, and `accessibilityState`.
- Make important headings discoverable with `accessibilityRole="header"`.
- Announce async state changes with `AccessibilityInfo.announceForAccessibility()`.
- Use `accessibilityRole="alert"` for error messages and other urgent feedback.
- Keep touch targets large. A good baseline is at least 44 by 44 points.
- Never rely on color alone to communicate status. Pair color with text and iconography.
- Respect dynamic type. Let text wrap and avoid fixed-height text containers.
- Preserve contrast. Aim for WCAG AA contrast even in mobile UI.
- Keep focus order logical from top to bottom and left to right.
- Avoid burying important actions behind gestures that screen readers cannot discover easily.

## Screen-specific advice for photo upload

- Tell the user what the picker button does before they open it.
- When a photo is selected, announce that a photo is ready.
- When upload starts, expose a busy state and progress messaging.
- When detection finishes, announce the breed and confidence.
- If detection fails, expose an alert role and a plain-language recovery path.

## Recommended built-in React Native APIs

- `accessibilityRole`
- `accessibilityLabel`
- `accessibilityHint`
- `accessibilityState`
- `AccessibilityInfo.announceForAccessibility()`
- `allowFontScaling`
- `maxFontSizeMultiplier`

## Things to test manually

- VoiceOver on iOS can complete the whole flow without sight.
- TalkBack on Android can complete the whole flow without sight.
- Large text sizes do not truncate button text or results.
- Screen rotation does not hide the primary action.
- Error messages are read automatically.

## References

- React Native accessibility docs: https://reactnative.dev/docs/accessibility
- WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- Mobile accessibility guidance from W3C: https://www.w3.org/WAI/mobile/
