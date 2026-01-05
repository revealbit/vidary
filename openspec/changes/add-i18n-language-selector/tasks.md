# Tasks: Add i18n Language Selector

## 1. Setup i18n Infrastructure
- [ ] 1.1 Install `react-i18next` and `i18next` dependencies
- [ ] 1.2 Create `src/i18n/` directory with i18n configuration
- [ ] 1.3 Create English translation file (`src/i18n/locales/en.json`)
- [ ] 1.4 Create Polish translation file (`src/i18n/locales/pl.json`)
- [ ] 1.5 Initialize i18n in `src/main.tsx`

## 2. Create Language Selector Component
- [ ] 2.1 Create `src/components/LanguageSelector/LanguageSelector.tsx` component
- [ ] 2.2 Style as a dropdown/combobox with flag icons or language names
- [ ] 2.3 Position in top-right corner of the interface
- [ ] 2.4 Implement language switching functionality
- [ ] 2.5 Persist language preference to localStorage

## 3. Update UI Components with Translations
- [ ] 3.1 Update `App.tsx` to include LanguageSelector
- [ ] 3.2 Update `Sidebar.tsx` with translation keys
- [ ] 3.3 Update `AddVideoModal.tsx` with translation keys
- [ ] 3.4 Update `AddGroupModal.tsx` with translation keys
- [ ] 3.5 Update `EditVideoModal.tsx` with translation keys
- [ ] 3.6 Update `VideoPlayer.tsx` with translation keys
- [ ] 3.7 Update `TreeView.tsx` and `TreeItem.tsx` with translation keys

## 4. Testing and Validation
- [ ] 4.1 Verify language switching works correctly
- [ ] 4.2 Verify language preference persists across page reloads
- [ ] 4.3 Verify all UI strings are translated in both languages
- [ ] 4.4 Run linting and build to ensure no errors
