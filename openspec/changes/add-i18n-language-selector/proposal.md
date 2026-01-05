# Change: Add i18n Language Selector

## Why
Users need the ability to switch between Polish and English languages in the interface. This improves accessibility for Polish-speaking users and establishes an internationalization foundation for future language additions.

## What Changes
- Add `react-i18next` and `i18next` libraries for internationalization
- Create translation files for Polish (`pl`) and English (`en`) languages
- Add a language selector dropdown/combobox in the top-right corner of the interface
- Persist language preference in localStorage
- Replace all hardcoded UI strings with translation keys

## Impact
- Affected specs: `i18n` (new capability)
- Affected code:
  - `src/App.tsx` - Add language selector component to top-right
  - `src/components/**` - Update all components with hardcoded strings
  - `src/i18n/` - New directory for i18n configuration and translation files
  - `src/stores/` - May need language preference in store (or use i18next built-in)
