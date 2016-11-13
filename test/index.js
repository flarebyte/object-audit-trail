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


test('objectAuditTrail should provide attribution', (t) => {
  t.plan(1);
  const actual = tested.getAttributionAsText([oneAuthor]);
  t.equal(actual,
  '"London gathering" by John Smith is licensed under CC BY 4.0',
  'as text');
});

test('objectAuditTrail should provide attribution within large limit', (t) => {
  t.plan(1);
  const opts = {
    limit: 100,
    strategy: 'length',
    target: 'text',
  };

  const actual = tested.getAttributionAsText([oneAuthor], opts);
  t.equal(actual,
  '"London gathering" by John Smith is licensed under CC BY 4.0',
  'as text with large limit');
});

test('objectAuditTrail should provide compact attribution', (t) => {
  t.plan(1);
  const opts = {
    limit: 40,
    strategy: 'length',
  };

  const actual = tested.getAttributionAsText([oneAuthor], opts);
  t.equal(actual,
  '"London gathering" by John Smith / CC BY',
  'compact license');
});


test('objectAuditTrail should provide short attribution', (t) => {
  t.plan(1);
  const opts = {
    limit: 35,
    strategy: 'length'
  };

  const actual = tested.getAttributionAsText([oneAuthor], opts);
  t.equal(actual,
  'Comic Script by John Smith / CC BY',
  'as short text');
});

test('objectAuditTrail should provide attribution with just author and license',
 (t) => {
   t.plan(1);
   const opts = {
     limit: 22,
     strategy: 'length',
   };

   const actual = tested.getAttributionAsText([oneAuthor], opts);
   t.equal(actual,
  'By John Smith / CC BY',
  'with just author and license');
 });
test('objectAuditTrail should provide attribution with just author', (t) => {
  t.plan(1);
  const opts = {
    limit: 15,
    strategy: 'length',
  };

  const actual = tested.getAttributionAsText([oneAuthor], opts);
  t.equal(actual,
  'By John Smith',
  'with just author');
});

test('objectAuditTrail should return empty null limit is too small ', (t) => {
  t.plan(1);
  const opts = {
    limit: 5,
    strategy: 'length',
  };

  const actual = tested.getAttributionAsText([oneAuthor], opts);
  t.equal(actual,
  null,
  'limit is too small');
});

test('objectAuditTrail should provide markdown attribution', (t) => {
  t.plan(1);
  const actual = tested.getAttributionAsMarkdown([oneAuthor]);
  t.equal(actual,
  '[London gathering](/comic-script/AAA) by [John Smith](/john-smith)'
  + ' is licensed under ' +
  '[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)',
  'as markdown');
});


test('objectAuditTrail should provide twitter attribution', (t) => {
  t.plan(1);
  const actual = tested.getTwitterAttribution([oneAuthor]);
  t.equal(actual,
  '"London gathering" by @johnsmith #CCBY: ' +
  'http:/website.com/comic-script/AAA',
  'as twitter');
});

test('objectAuditTrail should provide attribution with 2 authors', (t) => {
  t.plan(1);
  const actual = tested.getAttributionAsText([
    author3, oneAuthor, author4, secondAuthor, author5]);
  t.equal(actual,
  '"Underground" by Adele Smith is a derivative of "London gathering" by John Smith / CC BY',
  'by 2 authors as text');
});
