This is the Blind Coffee backend Azure Function called by Microsoft Flow.

## Query parameters

| Parameter   | Description | Default value |
| ----------- | ----------- | ------------- |
| `maxoffset` | Maximum allowed time distance between parties in minutes | `240` |
| `freshness` | None of the members have a match in the past 28 days | `30` |

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
  "pair": {                   // pair flat object with multiple properties (see call sample above)
      "name1": string,
      "email1": string,
      "location1": string,
      "name2": string,
      "email2": string,
      "location2": string
  },
  "debug": {
    "pairTimeDistance": 60,   // timezone distance between parties in minutes
    "maxOffset": 240          // maximum allowed time distance between parties in minutes
    "freshness": 28           // none of the members have a match in the past 28 days
  }
}
```

We signal end of pairs by returning `HTTP 417` to the caller -
```
HTTP/1.1 417 Expectation Failed

Expectation failed. No pair found.
We may or may not have reached END OF PAIRS.
```

Since this isn't deterministic as of right now, you should retry calling this function a few times.
If you still get `HTTP 417` it's probably safe to assume end of pairs.