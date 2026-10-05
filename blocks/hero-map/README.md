# hero-map

Custom **hero** block. Purpose: page-title-banner.

## Authoring (Document Authoring)

Model: `standalone`

Single block table.

- Row 1: the page title (`h1`). An optional picture replaces the bundled `world-map.svg`.
- Rows 2..n, one per marker: `country code` (e.g. `CA`) | `company logo picture + flag picture` | `link`.

Marker placement, layout and logo size are keyed on the country code in `hero-map.css`
(`.marker-<code>`; codes: ca us mx br uk nl ge ch fr sa in ph au). The values come from the source
site and line up with the bundled map. Codes with no CSS position are listed below the map.

With the bundled map, the SVG is inlined so that each marker's country is highlighted in turn
(every 2s, in marker order). Hovering or focusing a marker jumps the highlight to that country.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
