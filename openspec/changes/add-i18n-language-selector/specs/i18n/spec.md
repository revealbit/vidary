## ADDED Requirements

### Requirement: Internationalization Support
The system SHALL support multiple interface languages using the i18next framework.

#### Scenario: Default language detection
- **WHEN** user opens the application for the first time
- **THEN** the system SHALL detect the browser's preferred language
- **AND** if the preferred language is supported (English or Polish), use it as the default
- **AND** if the preferred language is not supported, default to English

#### Scenario: Language persistence
- **WHEN** user selects a language
- **THEN** the system SHALL persist the selection to localStorage
- **AND** on subsequent visits, the system SHALL use the persisted language preference

### Requirement: Language Selector UI
The system SHALL provide a language selector control in the top-right corner of the interface.

#### Scenario: Language selector visibility
- **WHEN** the application is loaded
- **THEN** a language selector dropdown/combobox SHALL be visible in the top-right corner
- **AND** the selector SHALL display the currently active language

#### Scenario: Language switching
- **WHEN** user clicks the language selector
- **THEN** a dropdown SHALL appear with available language options (English, Polish)
- **AND** when user selects a language
- **THEN** all UI text SHALL immediately update to the selected language

#### Scenario: Language selector positioning
- **WHEN** sidebar is visible or hidden
- **THEN** the language selector SHALL remain in the top-right corner of the viewport
- **AND** SHALL not overlap with other UI elements

### Requirement: Supported Languages
The system SHALL support English and Polish languages.

#### Scenario: English language support
- **WHEN** English is selected
- **THEN** all UI strings SHALL be displayed in English

#### Scenario: Polish language support
- **WHEN** Polish is selected
- **THEN** all UI strings SHALL be displayed in Polish

### Requirement: Translation Coverage
All user-facing text in the interface SHALL be translatable.

#### Scenario: Complete translation coverage
- **WHEN** any language is active
- **THEN** all button labels, tooltips, modal titles, placeholder text, and status messages SHALL be translated
- **AND** no hardcoded English strings SHALL appear when Polish is selected
