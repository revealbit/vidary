# Tasks: Add i18n Language Selector

## 1. Setup i18n Infrastructure
- [x] 1.1 Install `react-i18next` and `i18next` dependencies
- [x] 1.2 Create `src/i18n/` directory with i18n configuration
- [x] 1.3 Create English translation file (`src/i18n/locales/en.json`)
- [x] 1.4 Create Polish translation file (`src/i18n/locales/pl.json`)
- [x] 1.5 Initialize i18n in `src/main.tsx`

## 2. Create Language Selector Component
- [x] 2.1 Create `src/components/LanguageSelector/LanguageSelector.tsx` component
- [x] 2.2 Style as a dropdown/combobox with flag icons or language names
- [x] 2.3 Position in top-right corner of the interface
- [x] 2.4 Implement language switching functionality
- [x] 2.5 Persist language preference to localStorage

## 3. Update UI Components with Translations
- [x] 3.1 Update `App.tsx` to include LanguageSelector
- [x] 3.2 Update `Sidebar.tsx` with translation keys
- [x] 3.3 Update `AddVideoModal.tsx` with translation keys
- [x] 3.4 Update `AddGroupModal.tsx` with translation keys
- [x] 3.5 Update `EditVideoModal.tsx` with translation keys
- [x] 3.6 Update `VideoPlayer.tsx` with translation keys
- [x] 3.7 Update `TreeView.tsx` and `TreeItem.tsx` with translation keys

## 4. Testing and Validation
- [x] 4.1 Verify language switching works correctly
- [x] 4.2 Verify language preference persists across page reloads
- [x] 4.3 Verify all UI strings are translated in both languages
- [x] 4.4 Run linting and build to ensure no errors
