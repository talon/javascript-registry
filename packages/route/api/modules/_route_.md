[@talon/route](../README.md) › ["route"](_route_.md)

# External module: "route"

## Index

### Functions

- [decode](_route_.md#const-decode)
- [encode](_route_.md#const-encode)
- [keys](_route_.md#const-keys)
- [values](_route_.md#const-values)
- [withBody](_route_.md#const-withbody)
- [withConstant](_route_.md#const-withconstant)

## Functions

### `Const` decode

▸ **decode**(`route`: string, `url`: string): _object_

_Defined in [route.ts:17](https://github.com/talon/javascript-library/blob/5d8ff97/packages/route/lib/route.ts#L17)_

decode an object from a route

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `route` | string |
| `url`   | string |

**Returns:** _object_

---

### `Const` encode

▸ **encode**(`route`: string, `data`: object): _string_

_Defined in [route.ts:8](https://github.com/talon/javascript-library/blob/5d8ff97/packages/route/lib/route.ts#L8)_

encode an object into a route

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `route` | string |
| `data`  | object |

**Returns:** _string_

---

### `Const` keys

▸ **keys**(`route`: string): _string[]_

_Defined in [route.ts:53](https://github.com/talon/javascript-library/blob/5d8ff97/packages/route/lib/route.ts#L53)_

get the keys from a route or path

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `route` | string |

**Returns:** _string[]_

---

### `Const` values

▸ **values**(`route`: string): _string[]_

_Defined in [route.ts:68](https://github.com/talon/javascript-library/blob/5d8ff97/packages/route/lib/route.ts#L68)_

get the values from a route or path

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `route` | string |

**Returns:** _string[]_

---

### `Const` withBody

▸ **withBody**(`route`: string, `data`: object): _[string, object]_

_Defined in [route.ts:41](https://github.com/talon/javascript-library/blob/5d8ff97/packages/route/lib/route.ts#L41)_

encode an object into a route, include the excess object

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `route` | string |
| `data`  | object |

**Returns:** _[string, object]_

---

### `Const` withConstant

▸ **withConstant**(`route`: string, `url`: string): _object_

_Defined in [route.ts:29](https://github.com/talon/javascript-library/blob/5d8ff97/packages/route/lib/route.ts#L29)_

decode an object from a route, including the constant keys

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `route` | string |
| `url`   | string |

**Returns:** _object_
