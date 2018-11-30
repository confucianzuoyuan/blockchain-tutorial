```
counter = current_time # for example 15:03
count = INCR counter
EXPIRE counter 60 # just to make sure redis doesn't store it forever

if count > 5
  print "Exceeded the limit"
```
