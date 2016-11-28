# object-audit-trail

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> Object audit trail including revision and license

Provide attributions based on the best practices by [Creative Commons](See https://wiki.creativecommons.org/wiki/Best_practices_for_attribution).
However, this should also work for any kind of license.
Please note that we are in no way related to "Creative Commons"; just happens to like their guidelines ...
and this is a slightly opinionated interpretation.


Features:
* support a limit size for the attribution to cope with limited space.
* support output format as text, markdown or twitter.
* the template can be customized (i18n ...).
* display the last two authors or a single one.
* allows minor contributions to be ignored.


## Install

```sh
npm i -D object-audit-trail
```

## Usage

```js
import objectAuditTrail from "object-audit-trail"

const auditTrail = objectAuditTrail({
  curies: {
    wikipedia: 'http://wikipedia/about',
  },
  baseUrl: 'http:/website.com',
  ignoreTypeOfContribution: ['minor-change'],
});

auditTrail.getAttribution(history);
//return "alternative Headline 5" by Adele Smith is a derivative of "London gathering" by John Smith / CC BY 4.0

auditTrail.getAttribution(history, {format: 'markdown'});
//return ["alternative Headline 5"](http:/website.com/comic-script/EEE) by [Adele Smith](http:/website.com/adele-smith) is a derivative of ["London gathering"](http:/website.com/comic-script/AAA) by [John Smith](http:/website.com/john-smith) / [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

auditTrail.getAttribution(history, {format: 'twitter'});
//return "alternative Headline 5" by @adelesmith is a derivative of "London gathering" by @johnsmith #CCBY: http:/website.com/comic-script/EEE

auditTrail.getAttribution(history, {limit: 24});
//return By Adele Smith / CC BY
```

## License

MIT © [olih](http://github.com/flarebyte)

[npm-url]: https://npmjs.org/package/object-audit-trail
[npm-image]: https://img.shields.io/npm/v/object-audit-trail.svg?style=flat-square

[travis-url]: https://travis-ci.org/flarebyte/object-audit-trail
[travis-image]: https://img.shields.io/travis/flarebyte/object-audit-trail.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/flarebyte/object-audit-trail
[coveralls-image]: https://img.shields.io/coveralls/flarebyte/object-audit-trail.svg?style=flat-square

[depstat-url]: https://david-dm.org/flarebyte/object-audit-trail
[depstat-image]: https://david-dm.org/flarebyte/object-audit-trail.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/object-audit-trail.svg?style=flat-square
