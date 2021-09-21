This is the Blind Coffee backend Azure Function called by Microsoft Flow.

## Query parameters

| Parameter   | Description | Default value |
| ----------- | ----------- | ------------- |
| `maxoffset` | Maximum allowed time distance between parties in minutes | `240` |
| `freshness` | None of the members have a match in the past 28 days | `28` |

## Sample call

```bash
$ curl -i https://$AZURE_FUNCTION_URL/api/Pair \
    -H 'x-functions-key: cOdE=='

HTTP/1.1 200 OK
Transfer-Encoding: chunked
Content-Type: text/plain; charset=utf-8
Server: Kestrel

{
  "pair": {
      "name1": "Kim Kardashian",
      "email1": "kim@kardashian.com"
      "location1": "Netherlands "
      "name2": "Khloe Kardashian",
      "email2": "khloe@kardashian.com"
      "location2": "Germany"
  },
  "debug": {
    "pairTimeDistance": 60,
    "maxOffset": 240,
    "freshness" 28
  }
}
```

## Data model

```
{
  "pair": { },                 // pair flat object with multiple properties (see call sample above)
  "debug": {
    "pairTimeDistance": 60,   // timezone distance between parties in minutes
    "maxOffset": 240          // maximum allowed time distance between parties in minutes
    "freshness": 28           // none of the members have a match in the past 28 days
  }
}
```