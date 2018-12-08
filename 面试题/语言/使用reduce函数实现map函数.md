语法

```js
array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
```

```js
function mymap(arr, fn) {
  return arr.reduce(function(acc, item) {
    return acc.concat(fn(item))
  }, [])
}
```
