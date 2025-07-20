# 🧪 CineVerse Test Suite

Diese Test-Suite stellt sicher, dass die Streaming-Funktionalität der CineVerse-App korrekt funktioniert.

## 🚀 Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Tests ausführen

```bash
# Alle Tests ausführen
npm run test

# Nur Streaming-Tests ausführen
npm run test:streaming

# Tests einmalig ausführen (ohne Watch-Mode)
npm run test:run

# Tests mit Coverage
npm run test:coverage

# Tests mit UI
npm run test:ui
```

## 📋 Test-Kategorien

### 🎬 StreamingModal Tests
- ✅ Modal öffnet/schließt korrekt
- ✅ VidPlay URL wird korrekt generiert
- ✅ Loading-States funktionieren
- ✅ Error-Handling mit Retry-Funktionalität
- ✅ Vollbild-Modus
- ✅ Responsive Design

### 🎞️ MovieDetails Tests
- ✅ "Abspielen" Button öffnet StreamingModal
- ✅ API-Calls werden korrekt ausgeführt
- ✅ Movie-Daten werden angezeigt
- ✅ Error-States bei API-Fehlern
- ✅ Button-Styling und Layout

### 🎪 HeroBanner Tests
- ✅ "Abspielen" Button funktioniert
- ✅ Movie vs TV-Serie Erkennung
- ✅ Media-Type Handling
- ✅ Responsive Layout
- ✅ Netflix-ähnliches Design

### 🔄 Integration Tests
- ✅ End-to-End Streaming-Workflow
- ✅ Cross-Component Interaktion
- ✅ Performance-Tests
- ✅ Error-Recovery

## 🎯 Was wird getestet

### ✅ Video-Abspielung
```javascript
// Überprüft dass Videos korrekt abgespielt werden
expect(iframe).toHaveAttribute('src', 'https://vidsrc.cc/v2/embed/movie/123');
expect(iframe).toHaveAttribute('title', 'VidPlay Video Player');
```

### ✅ Button-Funktionalität
```javascript
// Überprüft dass "Abspielen" Button das Modal öffnet
fireEvent.click(playButton);
expect(screen.getByTestId('streaming-modal')).toBeInTheDocument();
```

### ✅ Error-Handling
```javascript
// Überprüft Fehlerbehandlung bei Server-Problemen
fireEvent.error(iframe);
expect(screen.getByTestId('error-screen')).toBeInTheDocument();
```

### ✅ Responsive Design
```javascript
// Überprüft responsive CSS-Klassen
expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
```

## 🛠️ Mock-System

Das Test-System verwendet intelligente Mocks für:

- **TMDB API**: Realistische Movie-Daten
- **StreamingModal**: Kontrollierte Modal-Tests
- **React Router**: Navigation-Tests
- **Browser APIs**: Fullscreen, LocalStorage, etc.

## 📊 Coverage-Ziele

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## 🐛 Debugging

### Tests lokal debuggen
```bash
# Tests mit detaillierter Ausgabe
npm run test -- --reporter=verbose

# Spezifischen Test ausführen
npm run test -- StreamingModal.test.jsx

# Tests im Watch-Mode
npm run test -- --watch
```

### Häufige Probleme

1. **Modal öffnet nicht**: Überprüfe `data-testid` Attribute
2. **Iframe lädt nicht**: Mock-URLs überprüfen
3. **API-Calls fehlgeschlagen**: Mock-Setup überprüfen

## 🚀 Continuous Integration

Diese Tests laufen automatisch bei:
- Pull Requests
- Main Branch Commits
- Release Builds

## 📈 Performance-Benchmarks

- **Modal öffnen**: <50ms
- **Video laden**: <100ms (simuliert)
- **100 Movies rendern**: <100ms
- **Test-Suite komplett**: <30s

## 🔧 Konfiguration

Test-Konfiguration in `vite.config.js`:
```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.js'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
``` 