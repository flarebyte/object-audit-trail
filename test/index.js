import test from 'tape'
import objectAuditTrail from '../src'
const oneAuthor = require('./one-author.json')

/*
See https://wiki.creativecommons.org/wiki/Best_practices_for_attribution
*/

const tested = objectAuditTrail();

test('objectAuditTrail should detect the shorter of two words', (t) => {
  t.plan(2)
  t.equal(tested.shorterOfTwo('ABCDE','ABC'), 'ABC', 'ABC')
  t.equal(tested.shorterOfTwo('Single'), 'Single', 'Single')
})

test('objectAuditTrail should detect the largest possible words', (t) => {
  t.plan(4)
  t.equal(tested.largestPossible(['ABCDE','ABC', 'abcdef'], 3), 'ABC', '3')
  t.equal(tested.largestPossible(['ABCDE','ABC', 'abcdef'], 5), 'ABCDE', '5')
  t.equal(tested.largestPossible(['ABCDE','ABC', 'abcdef'], 10), 'abcdef', '10')
  t.equal(tested.largestPossible(['ABCDE','ABC', 'abcdef'], 2), null, 'no')

})


test('objectAuditTrail should provide attribution', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor])
  t.equal(actual,
  'London gathering by John Smith is licensed under CC BY 4.0',
  'as text')
})

test('objectAuditTrail should provide attribution within large limit', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor], 100)
  t.equal(actual,
  'London gathering by John Smith is licensed under CC BY 4.0',
  'as text with large limit')
})

test('objectAuditTrail should provide compact attribution', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor], 40)
  t.equal(actual,
  'London gathering by John Smith / CC BY',
  'compact license')
})


test('objectAuditTrail should provide short attribution', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor], 35)
  t.equal(actual,
  'Comic Script by John Smith / CC BY',
  'as short text')

})

test('objectAuditTrail should provide attribution with just author and license',
 (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor], 22)
  t.equal(actual,
  'By John Smith / CC BY',
  'with just author and license')

})
test('objectAuditTrail should provide attribution with just author', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor], 15)
  t.equal(actual,
  'By John Smith',
  'with just author')
})

test('objectAuditTrail should return empty null limit is too small ', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsText([oneAuthor], 5)
  t.equal(actual,
  null,
  'limit is too small')
})

test('objectAuditTrail should provide markdown attribution', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsMarkdown([oneAuthor])
  t.equal(actual,
  '[London gathering](/comic-script/AAA) by [John Smith](/john-smith)'
  + 'is licensed under '+
  '[CC BY 4.0](https://creativecommons.org/licenses/by/2.0/)',
  'as markdown')

})

test('objectAuditTrail should provide short markdown attribution', (t) => {
  t.plan(1)
  const actual = tested.getAttributionAsMarkdown([oneAuthor], 35)
  t.equal(actual,
  '[Comic Script](/comic-script/AAA) by [John Smith](/john-smith)'
  + ' / '+
  '[CC BY](https://creativecommons.org/licenses/by/2.0/)',
  'as short markdown')

})

test('objectAuditTrail should provide twitter attribution', (t) => {
  t.plan(1)
  const actual = tested.getTwitterAttribution([oneAuthor])
  t.equal(actual,
  'London gathering by @johnsmith #CCBY : '+
  'http:/website.com/comic-script/AAA',
  'as twitter')

})
