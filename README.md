# AZCore

AZCore JavaScript FrameWork Designed To Simplify Development.

---

## Table of Contents

- [Installation](#installation)
  - [AZElement](#azelement)
  - [AZFragment](#azfragment)
  - [AZRouter](#azrouter)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

Include AZCore in your project by adding it as a JavaScript file:

```html
<script src="path/to/AZCore.js"></script>
```

---

## AZElement
AZElement is a utility function to create DOM elements efficiently.

### Syntax
```javascript
AZElement(tag, attributes = {}, textContent = '', children = [], isSVG = false)
```

### Parameters
- **tag**: (String) The HTML/SVG tag name.
- **attributes**: (Object) Key-value pairs for element attributes, styles, events, etc.
- **textContent**: (String) The text content of the element.
- **children**: (Array) Child elements or strings.
- **isSVG**: (Boolean) Whether the element is an SVG.

### Example
```javascript
const div = AZElement('div', { className: 'container' }, 'Hello World', [
    AZElement('span', {}, 'Child Element')
]);
document.body.appendChild(div);
```

---

## AZFragment
AZFragment helps in grouping multiple elements for efficient rendering.

### Syntax
```javascript
AZFragment(children = [])
```

### Parameters
- **children**: (Array) A list of nodes or strings.

### Example
```javascript
const fragment = AZFragment([
    AZElement('div', {}, 'First Element'),
    AZElement('div', {}, 'Second Element')
]);
document.body.appendChild(fragment);
```

---

## AZRouter
AZRouter is a routing system for SPAs.

### Constructor
```javascript
new AZRouter(routes, options = {})
```

### routes

| Affix | Type | Description | Default / Options |
|---|---:|---|---|
| on | String | Route path (e.g., `/about`, `/user/:id`) | — |
| onBEFORE | Logic | Logic to execute before showing the view | — |
| onREDIRECT | Object | Redirect settings | `{ ON: <path>, REDIRECT: "ON" \| "OFF" }` |
| onVIEW | Object | View settings | `{ META: AZElement \| AZFragment, VIEW: AZElement \| AZFragment, PRESERVE: [attributes] (default: ["[azcore]"]) }` |
| onPROGRESS | Object | Progress indicator settings | `{ PROGRESS: "ON" \| "OFF" (default: "ON"), SELECTOR: <attribute|tag> (default: "body") }` |
| onTRANSITION | Object | Transition settings | `{ IN: <AZCore.css option> (default: "AZ-FADE-IN"), OUT: <AZCore.css option> (default: "AZ-FADE-OUT"), TRANSITION: "ON" \| "OFF" (default: "ON") }` |
| onSCROLL | Object | Scroll restore/behavior | `{ RESTORE: "ON" \| "OFF" (default: "ON"), BEHAVIOR: "smooth" \| "auto" (default: "smooth") }` |
| onLOADED | Logic | Logic to execute after view loaded (before show) | — |
| onLEAVE | Logic | Logic to execute before leaving view | — |
| onCLEAN | String | Cleanup option | "ON" \| "OFF" (default: "OFF") |

### options (defaults)

| Affix | Type | Description | Default / Options |
|---|---:|---|---|
| onDEV | String | Debugging mode | "ON" \| "OFF" (default: "OFF") |
| onAPP | String | Append selector for mounting app | (default: `#app`) |
| onROOT | String | Base path for routes | (default: `/`) |
| on404 | String | Fallback route for unrecognized paths | (default: `/404`) |
| onMODE | String | Routing mode | "history" \| "hash" (default: "history") |
| onBEFORE | Logic | Global logic before showing view | — |
| onPROGRESS | Object | Default progress settings | `{ PROGRESS: "ON" \| "OFF" (default: "ON"), SELECTOR: <attribute|tag> (default: "body") }` |
| onTRANSITION | Object | Default transition settings | `{ IN: <AZCore.css option> (default: "AZ-FADE-IN"), OUT: <AZCore.css option> (default: "AZ-FADE-OUT"), TRANSITION: "ON" \| "OFF" (default: "ON") }` |
| onSCROLL | Object | Default scroll settings | `{ RESTORE: "ON" \| "OFF" (default: "ON"), BEHAVIOR: "smooth" \| "auto" (default: "smooth") }` |
| onCLEAN | String | Default cleanup option | "ON" \| "OFF" (default: "OFF") |

> NOTE
>> IF YOU DON'T MENTION AFFIXES FOR DEFAULT OPTIONS IT WILL FALL BACK TO DEFAULT VALUE.
>> YOU ONLY NEED TO MENTION THE AFFIX VALUE YOU CHANGE.

### Methods
- back(): Navigate to the previous route.
- forward(): Navigate to the next route.
- navigateTo(url, options): Navigate to a specific route.

### Example
```javascript
new AZRouter(
        [
                // ROUTE...
                {
                        // AFFIXES...
                        on: '/',
                        onBEFORE: (PARAMS) => console.log('onBEFORE:', PARAMS),
                        onREDIRECT: { 
                                ON: '/404',
                                REDIRECT: 'ON'
                        },
                        onVIEW: {
                                STAY: ['[azcore]'],
                                META: AZElement('head', {}, '', [
                                        AZElement('title', {}, 'AZCore')
                                ]),
                                VIEW: AZElement('div', { id: 'app' }, '', [
                                        AZElement('h1', {}, 'Hello World')
                                ]),
                        },
                        onERROR: '',
                        onPROGRESS: { 
                                PROGRESS: 'OFF'
                        },
                        onTRANSITION: {
                                TRANSITION: 'OFF'
                        },
                        onSCROLL: {
                                BEHAVIOR: 'AUTO'
                        },
                        onLOADED: async (PARAMS) => console.log('onLOADED:', PARAMS),
                        onLEAVE: async function (PARAMS){ console.log('onLEAVE:', PARAMS)},
                        onCLEAN: 'OFF'
                },
                {
                        // AFFIXES...
                        // SAME AS PREVIOUS ONE...
                }
        ],
        // OPTIONS...
        {
                onDEV: 'OFF',
                onAPP: '#app',
                onROOT: '/',
                on404: '/404',
                onMODE: 'history',
                onBEFORE:'',
                onPROGRESS: {
                        PROGRESS: 'ON',
                        SELECTOR: 'body'
                },
                onTRANSITION: {
                        IN: 'AZ-FADE-IN',
                        OUT: 'AZ-FADE-OUT',
                        TRANSITION: 'ON'
                },
                onSCROLL: {
                        RESTORE: 'ON',
                        BEHAVIOR: 'SMOOTH'
                },
                onCLEAN:'OFF'
);
```

---

## Contributing

Contributions are welcome! Please read contribution guide and start contribute.

---

## License

[MIT License](LICENSE.md) © AZCore