import test from 'tape';
import objectAuditTrail from '../src';

const oneAuthor = require('./one-author.json');
const secondAuthor = require('./second-author.json');
const author3 = require('./third-author.json');
const author4 = require('./fourth-author.json');
const author5 = require('./fifth-author.json');

/*
See https://wiki.creativecommons.org/wiki/Best_practices_for_attribution
*/

const tested = objectAuditTrail({
  curies: {
    wikipedia: 'http://wikipedia/about',
  },
  baseUrl: 'http:/website.com',
  headLineMaxSize: 30,
  ignoreTypeOfContribution: ['minor-change'],
});

test('objectAuditTrail should extract the major contributions', (t) => {
  t.plan(4);
  const hist = [
    {
      author: { name: 'A' },
      typeOfContribution: { name: 'W1' },
    },
    {
      author: { name: 'A1' },
      typeOfContribution: { name: 'minor-change' },
    },
    {
      author: { name: 'B' },
      typeOfContribution: { name: 'W2' },
    },
    {
      author: { name: 'C' },
      typeOfContribution: { name: 'W3' },
    },
    {
      author: { name: 'D' },
      typeOfContribution: { name: 'minor-change' },
    },
    {
      author: { name: 'E' },
      typeOfContribution: { name: 'minor-change' },
    },
  ];
  t.equal(tested.onlyMajorContributions(hist).length, 3, 'size');
  t.equal(tested.onlyMajorContributions(hist)[0].author.name, 'A', 'A');
  t.equal(tested.onlyMajorContributions(hist)[1].author.name, 'B', 'B');
  t.equal(tested.onlyMajorContributions(hist)[2].author.name, 'C', 'C');
});

test('objectAuditTrail should extract the copy edited contribution', (t) => {
  t.plan(4);
  const hist = [
    {
      url: 'A',
      typeOfContribution: { name: 'W1' },
    },
    {
      url: 'A1',
      typeOfContribution: { name: 'minor-change' },
    },
    {
      url: 'B',
      typeOfContribution: { name: 'W2' },
    },
    {
      url: 'C',
      typeOfContribution: { name: 'W3' },
    },
    {
      url: 'D',
      typeOfContribution: { name: 'minor-change' },
    },
    {
      url: 'E',
      typeOfContribution: { name: 'minor-change' },
    },
  ];
  t.equal(tested.copyeditedContributionAfter(hist, 'A').url, 'A1', 'A1');
  t.equal(tested.copyeditedContributionAfter(hist, 'B').url, 'B', 'B');
  t.equal(tested.copyeditedContributionAfter(hist, 'C').url, 'E', 'E');
  t.equal(tested.copyeditedContributionAfter(hist, 'Z'), null, 'Z');
});

test('objectAuditTrail should uncurie urls', (t) => {
  t.plan(6);
  t.equal(tested.uncurie(null), null, 'A');
  t.equal(tested.uncurie(''), '', 'B');
  t.equal(tested.uncurie('alpha'), 'http:/website.com/alpha', 'C');
  t.equal(tested.uncurie('/alpha/beta'), 'http:/website.com/alpha/beta', 'D');
  t.equal(tested.uncurie('http://bbc.com/story'), 'http://bbc.com/story', 'E');
  t.equal(tested.uncurie('wikipedia:abc'), 'http://wikipedia/about/abc', 'F');
});


test('objectAuditTrail should provide attribution', (t) => {
  t.plan(1);
  const actual = tested.getAttribution([oneAuthor]);
  t.equal(actual,
  '"London gathering" by John Smith is licensed under CC BY 4.0',
  'as text');
});

test('objectAuditTrail should provide attribution within large limit', (t) => {
  t.plan(1);
  const opts = {
    limit: 100,
  };

  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  '"London gathering" by John Smith is licensed under CC BY 4.0',
  'as text with large limit');
});

test('objectAuditTrail should provide compact attribution', (t) => {
  t.plan(1);
  const opts = {
    limit: 40,
  };

  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  '"London gathering" by John Smith / CC BY',
  'compact license');
});


test('objectAuditTrail should provide short attribution', (t) => {
  t.plan(1);
  const opts = {
    limit: 35,
  };

  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  'Comic Script by John Smith / CC BY',
  'as short text');
});

test('objectAuditTrail should provide attribution with just author and license',
 (t) => {
   t.plan(1);
   const opts = {
     limit: 22,
   };

   const actual = tested.getAttribution([oneAuthor], opts);
   t.equal(actual,
  'By John Smith / CC BY',
  'with just author and license');
 });
test('objectAuditTrail should provide attribution with just author', (t) => {
  t.plan(1);
  const opts = {
    limit: 15,
    format: 'text',
  };

  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  'By John Smith',
  'with just author');
});

test('objectAuditTrail should return empty null limit is too small ', (t) => {
  t.plan(1);
  const opts = {
    limit: 5,
  };

  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  null,
  'limit is too small');
});

test('objectAuditTrail should provide markdown attribution', (t) => {
  t.plan(1);
  const opts = {
    format: 'markdown',
  };
  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  '["London gathering"](/comic-script/AAA) by [John Smith](/john-smith)'
  + ' is licensed under ' +
  '[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)',
  'as markdown');
});


test('objectAuditTrail should provide twitter attribution', (t) => {
  t.plan(1);
  const opts = {
    format: 'twitter',
  };
  const actual = tested.getAttribution([oneAuthor], opts);
  t.equal(actual,
  '"London gathering" by @johnsmith #CCBY: ' +
  'http:/website.com/comic-script/AAA',
  'as twitter');
});

test('objectAuditTrail should provide attribution with 2 authors', (t) => {
  // t.plan(1);
  // const actual = tested.getAttributionAsText([
  //   author3, oneAuthor, author4, secondAuthor, author5]);
  // t.equal(actual,
  // '"Underground" by Adele Smith is a derivative of "London gathering" by John Smith / CC BY',
  // 'by 2 authors as text');
});
